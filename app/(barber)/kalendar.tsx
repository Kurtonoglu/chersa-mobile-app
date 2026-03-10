import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { confirm } from '../../lib/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
  parseISO,
} from 'date-fns';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';
import { Appointment } from '../../lib/mockData';

// ── Status helpers ─────────────────────────────────────────────────────────────

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

// ── Bottom sheet for day detail ────────────────────────────────────────────────

interface DaySheetProps {
  visible: boolean;
  dateStr: string;
  appointments: Appointment[];
  services: ReturnType<typeof useAppStore.getState>['services'];
  isBlocked: boolean;
  blockedReason: string;
  onBlock: () => void;
  onUnblock: () => void;
  onClose: () => void;
}

function DaySheet({
  visible,
  dateStr,
  appointments,
  services,
  isBlocked,
  blockedReason,
  onBlock,
  onUnblock,
  onClose,
}: DaySheetProps) {
  const getServiceName = (id: string) =>
    services.find((s) => s.id === id)?.nameBS ?? '—';

  const date = dateStr ? parseISO(dateStr) : new Date();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={sheet.overlay}>
        <TouchableOpacity style={sheet.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={sheet.container}>
          {/* Handle */}
          <View style={sheet.handle} />

          {/* Header */}
          <View style={sheet.header}>
            <Text style={sheet.dateTitle}>
              {dateStr ? format(date, 'd. MMMM yyyy') : ''}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Blocked indicator */}
          {isBlocked && (
            <View style={sheet.blockedBanner}>
              <Ionicons name="lock-closed" size={14} color={Colors.error} />
              <Text style={sheet.blockedBannerText}>{blockedReason}</Text>
            </View>
          )}

          <ScrollView
            style={sheet.scroll}
            contentContainerStyle={sheet.scrollContent}
          >
            {appointments.length === 0 ? (
              <Text style={sheet.noAppts}>{t('barber.kalendar.noAppointments')}</Text>
            ) : (
              appointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((apt) => (
                  <View key={apt.id} style={sheet.aptRow}>
                    <Text style={sheet.aptTime}>{apt.time}</Text>
                    <View style={sheet.aptInfo}>
                      <Text style={sheet.aptName}>{apt.clientName}</Text>
                      <Text style={sheet.aptService}>{getServiceName(apt.serviceId)}</Text>
                    </View>
                    <View
                      style={[
                        sheet.aptStatus,
                        { backgroundColor: `${STATUS_COLOR[apt.status]}22` },
                      ]}
                    >
                      <Text style={[sheet.aptStatusText, { color: STATUS_COLOR[apt.status] }]}>
                        {t(STATUS_LABEL[apt.status])}
                      </Text>
                    </View>
                  </View>
                ))
            )}
          </ScrollView>

          {/* Block / Unblock button */}
          <View style={sheet.footer}>
            {isBlocked ? (
              <TouchableOpacity
                style={sheet.unblockBtn}
                onPress={onUnblock}
                activeOpacity={0.8}
              >
                <Ionicons name="lock-open-outline" size={16} color={Colors.success} />
                <Text style={sheet.unblockBtnText}>{t('barber.kalendar.unblockDay')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={sheet.blockBtn}
                onPress={onBlock}
                activeOpacity={0.8}
              >
                <Ionicons name="lock-closed-outline" size={16} color={Colors.error} />
                <Text style={sheet.blockBtnText}>{t('barber.kalendar.blockDay')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const sheet = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '75%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${Colors.error}18`,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${Colors.error}44`,
  },
  blockedBannerText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  scroll: { maxHeight: 300 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noAppts: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    textAlign: 'center',
    paddingVertical: 24,
  },
  aptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  aptTime: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '700',
    minWidth: 44,
  },
  aptInfo: { flex: 1 },
  aptName: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  aptService: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  aptStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  aptStatusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
  },
  blockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  blockBtnText: {
    color: Colors.error,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  unblockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.success,
  },
  unblockBtnText: {
    color: Colors.success,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function KalendarScreen() {
  const language = useAppStore((s) => s.language);
  const appointments = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const blockedDays = useAppStore((s) => s.blockedDays);
  const blockDay = useAppStore((s) => s.blockDay);
  const unblockDay = useAppStore((s) => s.unblockDay);

  void language;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const today = startOfDay(new Date());

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Leading blanks so Monday is first column (getDay returns 0=Sun,1=Mon...)
  const startWeekday = getDay(monthStart); // 0=Sun,1=Mon...
  // Convert to Monday-based: Mon=0,...,Sun=6
  const leadingBlanks = (startWeekday + 6) % 7;

  // Appointment count per day
  const countForDate = (dateStr: string) =>
    appointments.filter((a) => a.date === dateStr && a.status !== 'cancelled').length;

  const isBlockedDate = (dateStr: string) =>
    blockedDays.some((b) => b.date === dateStr);

  const blockedReasonFor = (dateStr: string) =>
    blockedDays.find((b) => b.date === dateStr)?.reason ?? '';

  const handleDayPress = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSheetVisible(true);
  };

  const handleBlock = () => {
    if (!selectedDate) return;
    confirm(
      t('barber.kalendar.blockTitle'),
      t('barber.kalendar.blockMessage'),
      {
        cancelText: t('common.cancel'),
        confirmText: t('common.confirm'),
        destructive: true,
        onConfirm: () => {
          blockDay(selectedDate, t('barber.kalendar.blockedLabel'));
          setSheetVisible(false);
        },
      },
    );
  };

  const handleUnblock = () => {
    if (!selectedDate) return;
    confirm(
      t('barber.kalendar.unblockTitle'),
      t('barber.kalendar.unblockMessage'),
      {
        cancelText: t('common.cancel'),
        confirmText: t('common.confirm'),
        onConfirm: () => {
          unblockDay(selectedDate);
          setSheetVisible(false);
        },
      },
    );
  };

  const selectedDayAppts = selectedDate
    ? appointments.filter((a) => a.date === selectedDate)
    : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page header ─────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{t('barber.kalendar.title')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Month navigator ───────────────────────────────────── */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
            style={styles.monthNavBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.monthLabel}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>

          <TouchableOpacity
            onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
            style={styles.monthNavBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Day-of-week headers (Mon-Sun) ─────────────────────── */}
        <View style={styles.weekHeaders}>
          {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map((d) => (
            <Text key={d} style={styles.weekHeaderText}>
              {d}
            </Text>
          ))}
        </View>

        {/* ── Calendar grid ─────────────────────────────────────── */}
        <View style={styles.grid}>
          {/* Leading blanks */}
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <View key={`blank-${i}`} style={styles.cell} />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isPast = isBefore(startOfDay(day), today);
            const isToday2 = isSameDay(day, today);
            const isSun = getDay(day) === 0;
            const blocked = isBlockedDate(dateStr);
            const count = countForDate(dateStr);

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.cell,
                  isToday2 && styles.cellToday,
                  blocked && styles.cellBlocked,
                ]}
                onPress={() => handleDayPress(dateStr)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.cellDay,
                    isPast && styles.cellDayPast,
                    isSun && styles.cellDaySun,
                    isToday2 && styles.cellDayToday,
                  ]}
                >
                  {day.getDate()}
                </Text>

                {blocked ? (
                  <View style={styles.blockedDot} />
                ) : count > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{count}</Text>
                  </View>
                ) : (
                  <View style={styles.countPlaceholder} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.legendText}>Termini</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
            <Text style={styles.legendText}>Blokirano</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Day detail bottom sheet ─────────────────────────────── */}
      <DaySheet
        visible={sheetVisible}
        dateStr={selectedDate ?? ''}
        appointments={selectedDayAppts}
        services={services}
        isBlocked={selectedDate ? isBlockedDate(selectedDate) : false}
        blockedReason={selectedDate ? blockedReasonFor(selectedDate) : ''}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
        onClose={() => setSheetVisible(false)}
      />
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
  pageTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // ── Month nav
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  monthNavBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // ── Grid
  weekHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 4,
    gap: 3,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  cellBlocked: {
    backgroundColor: `${Colors.error}14`,
  },
  cellDay: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  cellDayPast: {
    color: Colors.textSecondary,
    opacity: 0.5,
  },
  cellDaySun: {
    color: Colors.error,
    opacity: 0.7,
  },
  cellDayToday: {
    color: Colors.accent,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countBadgeText: {
    color: Colors.background,
    fontSize: 9,
    fontWeight: '700',
  },
  blockedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.error,
  },
  countPlaceholder: {
    height: 16,
  },

  // ── Legend
  legend: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },

  bottomSpacer: { height: 20 },
});
