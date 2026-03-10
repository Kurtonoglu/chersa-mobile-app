/**
 * lib/supabase.ts — Supabase client singleton.
 *
 * Credentials are read from EXPO_PUBLIC_* env vars so they are never
 * hardcoded. Set them in .env.local (see .env.example).
 *
 * react-native-url-polyfill MUST be imported before this module is loaded.
 * That import lives at the very top of index.ts.
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (__DEV__ && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is not set.\n' +
      'Copy .env.example → .env.local and fill in your project credentials.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    /**
     * Persist the Supabase session in AsyncStorage so the user stays logged in
     * between app restarts.
     *
     * NOTE: AsyncStorage is unencrypted. For production consider swapping this
     * for expo-secure-store via a custom storage adapter.
     *
     * TODO: Replace with SecureStore adapter before production:
     *   import * as SecureStore from 'expo-secure-store';
     *   storage: { getItem: SecureStore.getItemAsync, setItem: SecureStore.setItemAsync, ... }
     */
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // required for React Native (no browser)
  },
});
