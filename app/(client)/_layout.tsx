import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';

export default function ClientLayout() {
  const router = useRouter();

  // Subscribe to language so tab labels re-render on language change
  useAppStore((s) => s.language);
  const isLoggedIn = useAppStore((s) => s.currentUser.isLoggedIn);
  const fetchAppointmentsFromBackend = useAppStore((s) => s.fetchAppointmentsFromBackend);
  const fetchServicesFromBackend = useAppStore((s) => s.fetchServicesFromBackend);

  // When the user logs out, navigate to the landing screen.
  // useEffect avoids a render-time redirect that causes infinite re-render loops.
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn]);

  // Prime the store as soon as the user enters the client area.
  // Services and appointments are fetched once here so every screen has
  // fresh backend data without each triggering its own request.
  useEffect(() => {
    if (isLoggedIn) {
      fetchServicesFromBackend();
      fetchAppointmentsFromBackend();
    }
  }, [isLoggedIn]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="pocetna"
        options={{
          title: t('client.tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="termini"
        options={{
          title: t('client.tabs.termini'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifikacije"
        options={{
          title: t('client.tabs.notifications'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="postavke"
        options={{
          title: t('client.tabs.settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Booking screens — not rendered as tabs */}
      <Tabs.Screen name="booking" options={{ href: null }} />
    </Tabs>
  );
}
