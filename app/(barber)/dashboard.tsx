import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { confirm } from '../../lib/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';
import { Appointment } from '../../lib/mockData';

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  confirmed: Colors.success,
  pending: Colors.warning,
  cancelled: Colors.error,
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'status.confirmed',
  pending: 'status.pending',
  cancelled: 'status.cancelled',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <View style={[badge.wrap, { backgroundColor: `${STATUS_COLOR[status] ?? Colors.border}22` }]}>
      <View style={[badge.dot, { backgroundColor: STATUS_COLOR[status] ?? Colors.border }]} />
      <Text style={[badge.text, { color: STATUS_COLOR[status] ?? Colors.textSecondary }]}>
        {t(STATUS_LABEL[status] ?? 'status.pending')}
      </Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: FontSize.xs, fontWeight: '600' },
});

// ── Appointment card ───────────────────────────────────────────────────────────

interface AppointmentCardProps {
  appointment: Appointment;
  serviceName: string;
  serviceDuration: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function AppointmentCard({
  appointment,
  serviceName,
  serviceDuration,
  onConfirm,
  onCancel,
}: AppointmentCardProps) {
  const isCancelled = appointment.status === 'cancelled';

  return (
    <View style={card.container}>
      {/* Time column */}
      <View style={card.timeCol}>
        <Text style={card.time}>{appointment.time}</Text>
        <Text style={card.duration}>{serviceDuration} {t('common.minutes')}</Text>
      </View>

      {/* Info column */}
      <View style={card.infoCol}>
        <Text style={card.clientName}>{appointment.clientName}</Text>
        <Text style={card.phone}>{appointment.clientPhone}</Text>
        <Text style={card.serviceName}>{serviceName}</Text>
        <View style={card.badgeRow}>
          <StatusBadge status={appointment.status} />
        </View>

        {/* Actions */}
        {!isCancelled && (
          <View style={card.actionsRow}>
            {appointment.status !== 'confirmed' && (
              <TouchableOpacity
                style={card.confirmBtn}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Text style={card.confirmBtnText}>{t('barber.dashboard.confirmBtn')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={card.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={card.cancelBtnText}>{t('barber.dashboard.cancelBtn')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const card = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 14,
    marginBottom: 10,
  },
  timeCol: {
    alignItems: 'center',
    minWidth: 52,
    paddingTop: 2,
  },
  time: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  duration: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 4,
    textAlign: 'center',
  },
  infoCol: {
    flex: 1,
  },
  clientName: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '700',
    marginBottom: 2,
  },
  phone: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: 4,
  },
  serviceName: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmBtn: {
    flex: 1,
    height: 36,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: Colors.background,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});

// ── Summary card ──────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <View style={summary.card}>
      <Ionicons name={icon as never} size={20} color={Colors.accent} />
      <Text style={summary.value}>{value}</Text>
      <Text style={summary.label}>{label}</Text>
    </View>
  );
}

const summary = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  value: {
    color: Colors.accent,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const language = useAppStore((s) => s.language);
  const appointments = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const confirmAppointment = useAppStore((s) => s.confirmAppointment);
  const cancelAppointment = useAppStore((s) => s.cancelAppointment);

  // Today's date string for comparison
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Filter to today only, sort by time
  const todayAppts = appointments
    .filter((a) => a.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  // Summary calculations
  const total = todayAppts.length;
  const confirmed = todayAppts.filter((a) => a.status === 'confirmed').length;
  const earnings = todayAppts
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, a) => {
      const svc = services.find((s) => s.id === a.serviceId);
      return sum + (svc?.price ?? 0);
    }, 0);

  const getService = (id: string) => services.find((s) => s.id === id);

  const handleConfirm = (id: string) => {
    confirm(
      t('barber.dashboard.confirmTitle'),
      t('barber.dashboard.confirmMessage'),
      {
        cancelText: t('common.cancel'),
        confirmText: t('common.confirm'),
        onConfirm: () => confirmAppointment(id),
      },
    );
  };

  const handleCancel = (id: string) => {
    confirm(
      t('barber.dashboard.cancelTitle'),
      t('barber.dashboard.cancelMessage'),
      {
        cancelText: t('common.no'),
        confirmText: t('common.yes'),
        destructive: true,
        onConfirm: () => cancelAppointment(id),
      },
    );
  };

  // Formatted date — language subscription ensures re-render
  void language;
  const dateLabel = format(new Date(), 'EEEE, d. MMMM yyyy');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <Text style={styles.dateLabel}>{dateLabel}</Text>
        <Text style={styles.pageTitle}>{t('barber.dashboard.title')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Summary row ─────────────────────────────────────────── */}
        <View style={styles.summaryRow}>
          <SummaryCard
            icon="calendar-outline"
            value={String(total)}
            label={t('barber.dashboard.totalToday')}
          />
          <SummaryCard
            icon="checkmark-circle-outline"
            value={String(confirmed)}
            label={t('barber.dashboard.confirmedToday')}
          />
          <SummaryCard
            icon="cash-outline"
            value={`${earnings} ${t('common.currency')}`}
            label={t('barber.dashboard.earnings')}
          />
        </View>

        {/* ── Appointment list ──────────────────────────────────── */}
        {todayAppts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="sunny-outline" size={48} color={Colors.accent} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyText}>{t('barber.dashboard.noAppointments')}</Text>
          </View>
        ) : (
          todayAppts.map((apt) => {
            const svc = getService(apt.serviceId);
            return (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                serviceName={svc?.nameBS ?? '—'}
                serviceDuration={svc?.duration ?? 0}
                onConfirm={() => handleConfirm(apt.id)}
                onCancel={() => handleCancel(apt.id)}
              />
            );
          })
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  pageTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 24,
  },

  bottomSpacer: { height: 40 },
});
