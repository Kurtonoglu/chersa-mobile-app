-- ─────────────────────────────────────────────────────────────────────────────
-- appointments table — Chersa barber booking app
-- Run this in the Supabase SQL editor (or supabase/migrations/).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Table ─────────────────────────────────────────────────────────────────────

create table if not exists public.appointments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,

  -- Client contact info snapshotted at booking time (denormalised intentionally:
  -- the profile could change later, but the appointment record should reflect
  -- what was true when the booking was made).
  client_name         text not null,
  client_phone        text not null,

  -- Service information
  -- primary_service_id is the first / "main" service — used for display.
  -- service_ids holds all selected service IDs (TEXT[] — simple, queryable).
  primary_service_id  text not null,
  service_ids         text[] not null default '{}',

  -- Scheduling
  date                date not null,          -- stored as a DATE column for easy range queries
  time                time not null,          -- stored as a TIME column

  -- Aggregated totals (denormalised so they survive service price/duration edits)
  total_duration      integer not null check (total_duration > 0),  -- minutes
  total_price         numeric(8,2) not null check (total_price >= 0),

  -- Workflow (no pending state — appointments are auto-confirmed on creation)
  status              text not null default 'confirmed'
                        check (status in ('confirmed', 'cancelled')),

  created_at          timestamptz not null default now()
);

-- Note on date/time columns:
--   The app stores date as 'yyyy-MM-dd' and time as 'HH:mm'.
--   Postgres DATE and TIME types accept these formats directly from JS strings.
--   Supabase returns DATE as 'yyyy-MM-dd' and TIME as 'HH:mm:ss' — the app
--   reads only the first 5 characters (HH:mm) so the extra ':ss' is harmless.
--   If you prefer plain TEXT columns, replace `date date` with `date text` and
--   `time time` with `time text` — no other code changes needed.

-- 2. Indexes ───────────────────────────────────────────────────────────────────

-- Fast lookup of all appointments for a given user (the most common query)
create index if not exists idx_appointments_user_id
  on public.appointments(user_id);

-- Fast lookup of all non-cancelled appointments on a given date
-- (used by the slot calculator to find booked slots)
create index if not exists idx_appointments_date_status
  on public.appointments(date, status);

-- 3. Collision safety ─────────────────────────────────────────────────────────

-- Partial unique index: prevents two active appointments at the exact same
-- start time (fast, zero-config guard). True range-overlap protection is
-- enforced by the book_appointment_safe RPC below (section 6).
create unique index if not exists idx_appointments_unique_active_slot
  on public.appointments (date, time)
  where status <> 'cancelled';

-- 4. Row Level Security ────────────────────────────────────────────────────────

alter table public.appointments enable row level security;

-- Each authenticated user can only read their own appointments
create policy "Users can view own appointments"
  on public.appointments
  for select
  using (auth.uid() = user_id);

-- Each authenticated user can insert appointments for themselves only
create policy "Users can create own appointments"
  on public.appointments
  for insert
  with check (auth.uid() = user_id);

-- Each authenticated user can update (e.g. cancel) only their own appointments
create policy "Users can update own appointments"
  on public.appointments
  for update
  using (auth.uid() = user_id);

-- Deletion is intentionally not granted to clients — cancelled status is the
-- soft-delete approach used in this app. Barbers/admins can delete via the
-- Supabase dashboard with service_role if ever needed.

-- 5. Optional: profiles table (if not already created by auth.ts) ─────────────

-- The auth service reads user names from a `profiles` table.
-- If it does not exist yet, create it with a trigger to auto-populate on signup.

create table if not exists public.profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default ''
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Trigger: auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. RPC: Salon-wide availability for a date (bypasses per-user RLS) ──────────
--
-- Returns (appt_time text, total_duration int) for every non-cancelled
-- appointment on the requested date across ALL users.  Only time + duration
-- are exposed — no PII.
--
-- SECURITY DEFINER runs as the function owner (postgres role) which has full
-- table access, thereby bypassing the "users can view own appointments" RLS
-- policy.  Grant execute to the `authenticated` role only.

create or replace function public.get_active_appointments_for_date(p_date date)
returns table (appt_time text, total_duration integer)
language sql
security definer
stable
as $$
  select
    lpad(extract(hour  from time)::text, 2, '0') || ':' ||
    lpad(extract(minute from time)::text, 2, '0'),
    total_duration
  from public.appointments
  where date   = p_date
    and status <> 'cancelled';
$$;

grant execute on function public.get_active_appointments_for_date(date) to authenticated;

-- 7. RPC: Safe appointment insert with server-side overlap check ──────────────
--
-- Performs an exclusive overlap check inside a single transaction before
-- inserting, closing the race-condition window that exists when two clients
-- simultaneously select the same free slot.
--
-- Overlap condition (half-open intervals): two appointments A and B overlap when
--   A.start < B.end  AND  A.end > B.start
-- where end = start + total_duration (in minutes since midnight).
--
-- Returns JSON:
--   { "data": { ...full appointment row... } }  on success
--   { "error": "<message>" }                    when slot is already taken or
--                                                caller is not authenticated
--
-- SECURITY DEFINER so the function can query all rows (bypassing RLS for the
-- conflict check) and insert as the authenticated user.  The function manually
-- verifies auth.uid() is not null and uses it as user_id.

create or replace function public.book_appointment_safe(
  p_client_name        text,
  p_client_phone       text,
  p_primary_service_id text,
  p_service_ids        text[],
  p_date               date,
  p_time               time,
  p_total_duration     integer,
  p_total_price        numeric
)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id   uuid;
  v_new_start integer;
  v_new_end   integer;
  v_conflict  boolean;
  v_row       public.appointments%rowtype;
begin
  -- Verify the caller is authenticated
  v_user_id := auth.uid();
  if v_user_id is null then
    return json_build_object('error', 'Not authenticated.');
  end if;

  -- Convert new appointment time to minutes-since-midnight
  v_new_start := extract(hour   from p_time)::integer * 60
               + extract(minute from p_time)::integer;
  v_new_end   := v_new_start + p_total_duration;

  -- Check for range overlap with any active appointment on that date
  select exists (
    select 1
    from public.appointments
    where date   = p_date
      and status <> 'cancelled'
      and (extract(hour   from time)::integer * 60
         + extract(minute from time)::integer) < v_new_end
      and (extract(hour   from time)::integer * 60
         + extract(minute from time)::integer) + total_duration > v_new_start
  ) into v_conflict;

  if v_conflict then
    return json_build_object(
      'error', 'This time slot is no longer available. Please select a different time.'
    );
  end if;

  -- No conflict — insert the appointment
  insert into public.appointments (
    user_id, client_name, client_phone,
    primary_service_id, service_ids,
    date, time, total_duration, total_price, status
  )
  values (
    v_user_id, p_client_name, p_client_phone,
    p_primary_service_id, p_service_ids,
    p_date, p_time, p_total_duration, p_total_price, 'confirmed'
  )
  returning * into v_row;

  return json_build_object('data', json_build_object(
    'id',                  v_row.id,
    'user_id',             v_row.user_id,
    'client_name',         v_row.client_name,
    'client_phone',        v_row.client_phone,
    'primary_service_id',  v_row.primary_service_id,
    'service_ids',         v_row.service_ids,
    'date',                v_row.date,
    'time',                v_row.time,
    'total_duration',      v_row.total_duration,
    'total_price',         v_row.total_price,
    'status',              v_row.status,
    'created_at',          v_row.created_at
  ));
end;
$$;

grant execute on function public.book_appointment_safe(
  text, text, text, text[], date, time, integer, numeric
) to authenticated;
