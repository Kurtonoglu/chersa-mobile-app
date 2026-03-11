import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';

export default function BarberLayout() {
  // Subscribe to language so tab labels re-render on language change
  useAppStore((s) => s.language);
  const fetchServicesFromBackend = useAppStore((s) => s.fetchServicesFromBackend);

  // Load real services so the usluge (services management) screen is populated.
  useEffect(() => {
    fetchServicesFromBackend();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: '600',
        },
      }}
    >
      {/* PIN screen — not a tab, accessed via explicit navigation */}
      <Tabs.Screen
        name="pin"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('barber.tabs.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="kalendar"
        options={{
          title: t('barber.tabs.kalendar'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="rezervacije"
        options={{
          title: t('barber.tabs.rezervacije'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="usluge"
        options={{
          title: t('barber.tabs.usluge'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cut-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="postavke"
        options={{
          title: t('barber.tabs.postavke'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
