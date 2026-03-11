/**
 * services/services.ts — Services fetched from the Supabase `public.services` table.
 *
 * Actual table schema:
 *   id          uuid primary key default gen_random_uuid()
 *   name        text not null
 *   duration    integer not null  -- minutes
 *   price       numeric not null
 *   category    text not null  -- 'kosa' | 'brada' | 'paketi'
 *   created_at  timestamptz not null default now()
 *
 * Mapping notes:
 *   - `name` is mapped to both nameBS and nameEN on the app Service type
 *     because the DB stores a single name, not a bilingual pair.
 *   - `active` is not a DB column; every row returned is treated as active.
 *   - `description` is not a DB column; the field is omitted on mapped rows.
 */

import { supabase } from '../lib/supabase';
import { Service, ServiceCategory } from '../lib/mockData';
import { ServiceResult } from './auth';

// ─── DB-level type ────────────────────────────────────────────────────────────

interface DbService {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
  created_at: string;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function dbToService(db: DbService): Service {
  return {
    id: db.id,
    nameBS: db.name,
    nameEN: db.name,
    category: db.category as ServiceCategory,
    price: Number(db.price),
    duration: db.duration,
    active: true,
  };
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Fetch all services from the database, ordered alphabetically by name.
 */
export async function fetchServices(): Promise<ServiceResult<Service[]>> {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, duration, price, category, created_at')
    .order('created_at', { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: (data as DbService[]).map(dbToService), error: null };
}
