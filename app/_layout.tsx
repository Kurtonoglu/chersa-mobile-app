import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';

export default function RootLayout() {
  const setUser = useAppStore((s) => s.setUser);
  const logout = useAppStore((s) => s.logout);
  const setHydrating = useAppStore((s) => s.setHydrating);

  useEffect(() => {
    // Hydrate initial session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name ?? '',
          phone: session.user.phone ?? '',
          isLoggedIn: true,
        });
      } else {
        logout();
      }
      setHydrating(false);
    });

    // Keep store in sync with Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name ?? '',
          phone: session.user.phone ?? '',
          isLoggedIn: true,
        });
      } else {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
