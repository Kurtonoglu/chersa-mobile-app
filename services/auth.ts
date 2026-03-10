/**
 * services/auth.ts — Authentication service.
 *
 * Each function follows the { data, error } response shape.
 * Phone numbers must arrive pre-formatted as +387XXXXXXXXX.
 */

import { supabase } from '../lib/supabase';

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

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Register a new user with phone + password.
 * full_name is passed via options.data so a database trigger can populate
 * the profiles table on user creation.
 */
export async function registerWithPhone(
  name: string,
  phone: string,
  password: string,
): Promise<ServiceResult<AuthUser>> {
  const { data, error } = await supabase.auth.signUp({
    phone,
    password,
    options: {
      data: { full_name: name },
    },
  });

  if (error) return { data: null, error: error.message };
  if (!data.user) return { data: null, error: 'Registration failed. Please try again.' };

  return {
    data: { id: data.user.id, name, phone },
    error: null,
  };
}

/**
 * Log in with phone + password.
 * Fetches the user's name from the profiles table after a successful sign-in.
 */
export async function loginWithPhone(
  phone: string,
  password: string,
): Promise<ServiceResult<AuthUser>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    phone,
    password,
  });

  if (error) return { data: null, error: error.message };
  if (!data.user) return { data: null, error: 'Login failed. Please try again.' };

  // Fetch display name from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', data.user.id)
    .single();

  const name = profile?.full_name ?? '';

  if (profileError) {
    // Non-fatal: user is authenticated, name just won't be shown
    console.warn('[auth] Could not fetch profile:', profileError.message);
  }

  return {
    data: { id: data.user.id, name, phone },
    error: null,
  };
}

/**
 * Verify an SMS OTP code sent during registration.
 */
export async function verifySmsOtp(
  phone: string,
  otp: string,
): Promise<ServiceResult<boolean>> {
  const { error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: 'sms',
  });

  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

/**
 * Log out the current user and clear the Supabase session.
 */
export async function logout(): Promise<ServiceResult<boolean>> {
  const { error } = await supabase.auth.signOut();

  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}
