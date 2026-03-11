import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { confirm } from '../../lib/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { parseISO, getDay, format } from 'date-fns';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';
import { Appointment, AppointmentStatus } from '../../lib/mockData';

// ── Bosnian date helpers ─────────────────────────────────────────────────────

const BS_DAYS_SHORT = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
const BS_MONTHS_SHORT = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
];

const formatAppointmentDate = (dateStr: string): string => {
  const d = parseISO(dateStr);
  return `${BS_DAYS_SHORT[getDay(d)]}, ${d.getDate()}. ${BS_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}.`;
};

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AppointmentStatus, { bg: string; text: string }> = {
  confirmed: { bg: 'rgba(76,175,80,0.15)', text: Colors.success },
  cancelled: { bg: 'rgba(244,67,54,0.15)', text: Colors.error },
};

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { bg, text } = STATUS_CONFIG[status];
  const label = t(`status.${status}`);
  return (
    <View style={[badgeStyles.badge, { backgroundColor: bg }]}>
      <Text style={[badgeStyles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ── Appointment card ──────────────────────────────────────────────────────────

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: () => void;
}

function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
  const language = useAppStore((s) => s.language);
  const services = useAppStore((s) => s.services);

  const service = services.find((s) => s.id === appointment.serviceId);
  const serviceName = service
    ? language === 'en'
      ? service.nameEN
      : service.nameBS
    : '—';

  return (
    <View style={cardStyles.card}>
      {/* Top row: service name + status badge */}
      <View style={cardStyles.topRow}>
        <Text style={cardStyles.serviceName} numberOfLines={1}>
          {serviceName}
        </Text>
        <StatusBadge status={appointment.status} />
      </View>

      {/* Date + time */}
      <View style={cardStyles.metaRow}>
        <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
        <Text style={cardStyles.metaText}>
          {formatAppointmentDate(appointment.date)}
        </Text>
        <View style={cardStyles.metaDot} />
        <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
        <Text style={cardStyles.metaText}>{appointment.time}</Text>
      </View>

      {/* Price + client */}
      <View style={cardStyles.priceRow}>
        <View style={cardStyles.clientRow}>
          <Ionicons name="person-outline" size={13} color={Colors.textSecondary} />
          <Text style={cardStyles.clientText} numberOfLines={1}>
            {appointment.clientName}
          </Text>
        </View>
        <Text style={cardStyles.price}>
          {`${appointment.totalPrice ?? service?.price ?? 0} ${t('common.currency')}`}
        </Text>
      </View>

      {/* Cancel button */}
      {appointment.status !== 'cancelled' && (
        <TouchableOpacity
          style={cardStyles.cancelBtn}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle-outline" size={16} color={Colors.error} />
          <Text style={cardStyles.cancelBtnText}>{t('client.termini.cancelBtn')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  serviceName: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '700',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.border,
    marginHorizontal: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  clientText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    flex: 1,
  },
  price: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    minHeight: 44,
  },
  cancelBtnText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={emptyStyles.container}>
      <Ionicons name="calendar-outline" size={52} color={Colors.border} />
      <Text style={emptyStyles.text}>{t('client.termini.emptyUpcoming')}</Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
    paddingVertical: 60,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
});

// ── Screen ───────────────────────────────────────────────────────────────────

export default function TerminiScreen() {
  useAppStore((s) => s.language);
  const appointments = useAppStore((s) => s.appointments);
  const currentUser = useAppStore((s) => s.currentUser);
  const cancelAppointmentAsync = useAppStore((s) => s.cancelAppointmentAsync);
  const fetchAppointmentsFromBackend = useAppStore((s) => s.fetchAppointmentsFromBackend);
  const appointmentsLoading = useAppStore((s) => s.appointmentsLoading);
  const appointmentsError = useAppStore((s) => s.appointmentsError);

  // Load the user's appointments from Supabase on first render
  useEffect(() => {
    fetchAppointmentsFromBackend();
  }, []);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => a.clientPhone === currentUser.phone && a.status !== 'cancelled' && a.date >= todayStr)
        .sort((a, b) =>
          a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
        ),
    [appointments, currentUser.phone, todayStr],
  );

  const handleCancel = (appt: Appointment) => {
    confirm(
      t('client.termini.cancelTitle'),
      t('client.termini.cancelMessage'),
      {
        cancelText: t('common.no'),
        confirmText: t('common.yes'),
        destructive: true,
        onConfirm: () => { cancelAppointmentAsync(appt.id); },
      },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Screen header ─────────────────────────────────────── */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>{t('client.termini.title')}</Text>
      </View>

      {/* ── Content ───────────────────────────────────────────── */}
      {appointmentsLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : appointmentsError ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{appointmentsError}</Text>
          <TouchableOpacity onPress={fetchAppointmentsFromBackend} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Pokušaj ponovo</Text>
          </TouchableOpacity>
        </View>
      ) : upcoming.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {upcoming.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onCancel={() => handleCancel(appt)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  screenHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  screenTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ── Loading / error center states
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  retryBtn: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    color: Colors.accent,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
