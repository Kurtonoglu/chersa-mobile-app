/**
 * services/appointments.ts — Appointments service.
 *
 * CURRENT STATE: mock implementations (delegates to in-memory state).
 * BACKEND TODO: replace each function body with the Supabase query shown in
 * the comment and remove the mock block.
 *
 * All functions return { data, error } — wire them up in the Zustand store's
 * async action wrappers using setAppointmentsLoading / setAppointmentsError.
 */

// import { supabase } from '../lib/supabase';
import { Appointment, AppointmentStatus } from '../lib/mockData';
import { ServiceResult } from './auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NewAppointment = Omit<Appointment, 'id' | 'createdAt'>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Fetch all appointments for the current user.
 *
 * BACKEND TODO:
 *   const { data, error } = await supabase
 *     .from('appointments')
 *     .select('*')
 *     .order('date', { ascending: true })
 *     .order('time', { ascending: true });
 *   if (error) return { data: null, error: error.message };
 *   return { data, error: null };
 */
export async function fetchAppointments(): Promise<ServiceResult<Appointment[]>> {
  await delay(300);
  // Mock: return empty — caller uses Zustand store's in-memory appointments
  return { data: [], error: null };
}

/**
 * Create a new appointment.
 *
 * BACKEND TODO:
 *   const { data, error } = await supabase
 *     .from('appointments')
 *     .insert({ ...appointment, created_at: new Date().toISOString() })
 *     .select()
 *     .single();
 *   if (error) return { data: null, error: error.message };
 *   return { data, error: null };
 */
export async function createAppointment(
  appointment: NewAppointment,
): Promise<ServiceResult<Appointment>> {
  await delay(400);
  const created: Appointment = {
    ...appointment,
    id: `a_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return { data: created, error: null };
}

/**
 * Update the status of an existing appointment.
 *
 * BACKEND TODO:
 *   const { data, error } = await supabase
 *     .from('appointments')
 *     .update({ status })
 *     .eq('id', id)
 *     .select()
 *     .single();
 *   if (error) return { data: null, error: error.message };
 *   return { data, error: null };
 */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<ServiceResult<{ id: string; status: AppointmentStatus }>> {
  await delay(300);
  return { data: { id, status }, error: null };
}

/**
 * Cancel an appointment (convenience wrapper around updateAppointmentStatus).
 *
 * BACKEND TODO: same as updateAppointmentStatus with status = 'cancelled'.
 * Consider also sending a notification to the client here.
 */
export async function cancelAppointment(
  id: string,
): Promise<ServiceResult<{ id: string }>> {
  await delay(300);
  return { data: { id }, error: null };
}
