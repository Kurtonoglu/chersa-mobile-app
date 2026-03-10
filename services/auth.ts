/**
 * services/auth.ts — Authentication service.
 *
 * Each function follows the { data, error } response shape that mirrors
 * Supabase's own API, making the swap from mock → real implementation
 * a drop-in replacement.
 *
 * CURRENT STATE: mock implementations (500 ms delay, no real network call).
 * BACKEND TODO: uncomment the Supabase calls and delete the mock blocks.
 */

// import { supabase } from '../lib/supabase';

// ─── Shared result type ───────────────────────────────────────────────────────

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Register a new user with phone + password.
 * On success, the returned AuthUser should be persisted in Zustand + AsyncStorage.
 *
 * BACKEND TODO:
 *   const { data, error } = await supabase.auth.signUp({ phone, password });
 *   if (error) return { data: null, error: error.message };
 *   // Then insert a profile row: supabase.from('profiles').insert({ id: data.user.id, name, phone })
 *   return { data: { id: data.user.id, name, phone }, error: null };
 */
export async function registerWithPhone(
  name: string,
  phone: string,
  _password: string,
): Promise<ServiceResult<AuthUser>> {
  await delay(500);
  // Mock: any valid input succeeds
  return {
    data: { id: `mock_${Date.now()}`, name, phone },
    error: null,
  };
}

/**
 * Log in with phone + password.
 *
 * BACKEND TODO:
 *   const { data, error } = await supabase.auth.signInWithPassword({ phone, password });
 *   if (error) return { data: null, error: error.message };
 *   const profile = await supabase.from('profiles').select('name, phone').eq('id', data.user.id).single();
 *   return { data: { id: data.user.id, name: profile.data.name, phone: profile.data.phone }, error: null };
 */
export async function loginWithPhone(
  phone: string,
  _password: string,
): Promise<ServiceResult<AuthUser>> {
  await delay(500);
  // Mock: any phone (9+ digits) + any password (6+ chars) succeeds
  return {
    data: { id: `mock_${Date.now()}`, name: 'Korisnik', phone },
    error: null,
  };
}

/**
 * Log out the current user.
 *
 * BACKEND TODO:
 *   const { error } = await supabase.auth.signOut();
 *   if (error) return { data: null, error: error.message };
 *   return { data: true, error: null };
 */
export async function logout(): Promise<ServiceResult<boolean>> {
  await delay(200);
  return { data: true, error: null };
}

/**
 * Verify an SMS OTP code sent during registration.
 * Returns the verified user on success.
 *
 * BACKEND TODO:
 *   const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
 *   if (error) return { data: null, error: error.message };
 *   return { data: { id: data.user.id, name: '', phone }, error: null };
 */
export async function verifySmsOtp(
  _phone: string,
  otp: string,
): Promise<ServiceResult<boolean>> {
  await delay(300);
  // Mock: only '1234' is valid
  if (otp !== '1234') {
    return { data: null, error: 'Invalid OTP code.' };
  }
  return { data: true, error: null };
}
