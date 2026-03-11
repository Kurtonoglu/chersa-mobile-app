import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { parseISO } from 'date-fns';
import { Colors } from '../../../constants/colors';
import { FontSize } from '../../../constants/typography';
import { t } from '../../../lib/i18n';
import { useAppStore } from '../../../store/useAppStore';
import { calculateSlots, BookedSlot } from '../../../lib/slotCalculator';
import { SHOP_INFO } from '../../../lib/mockData';

// ── Bosnian date/service display ─────────────────────────────────────────────

const BS_MONTHS_SHORT = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
];

const formatDateDisplay = (dateStr: string): string => {
  const d = parseISO(dateStr);
  return `${d.getDate()}. ${BS_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}.`;
};

// ── Screen ───────────────────────────────────────────────────────────────────

export default function BookingTimeScreen() {
  const router = useRouter();
  const { date, serviceId, serviceIds, totalPrice, totalDuration } = useLocalSearchParams<{
    date: string;
    serviceId: string;
    serviceIds: string;
    totalPrice: string;
    totalDuration: string;
  }>();

  const language = useAppStore((s) => s.language);
  const services = useAppStore((s) => s.services);
  const appointments = useAppStore((s) => s.appointments);
  const setBookingTime = useAppStore((s) => s.setBookingTime);
  const fetchAppointmentsFromBackend = useAppStore((s) => s.fetchAppointmentsFromBackend);

  // Ensure slots reflect actual backend bookings — the layout primes the store
  // on login, but a direct refresh or deep-link could bypass it.
  useEffect(() => {
    fetchAppointmentsFromBackend();
  }, []);

  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const service = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId],
  );

  const stripName = useMemo(() => {
    const ids = serviceIds ? serviceIds.split(',') : serviceId ? [serviceId] : [];
    return ids
      .map((id) => {
        const svc = services.find((s) => s.id === id);
        return svc ? (language === 'en' ? svc.nameEN : svc.nameBS) : null;
      })
      .filter(Boolean)
      .join(' + ');
  }, [serviceIds, serviceId, services, language]);

  // Booked slots for this date (exclude cancelled).
  // Prefer totalDuration from the appointment (supports multi-service bookings)
  // and fall back to the primary service duration for legacy/mock data.
  const bookedSlots = useMemo<BookedSlot[]>(() => {
    return appointments
      .filter((a) => a.date === date && a.status !== 'cancelled')
      .map((a) => {
        const svc = services.find((s) => s.id === a.serviceId);
        const duration = a.totalDuration ?? svc?.duration ?? 0;
        return { time: a.time, duration };
      });
  }, [date, appointments, services]);

  const duration = totalDuration ? Number(totalDuration) : (service?.duration ?? 0);

  // Available slots based on total selected service duration
  const availableSlots = useMemo<string[]>(() => {
    if (!duration || !date) return [];
    return calculateSlots(
      parseISO(date),
      duration,
      bookedSlots,
      SHOP_INFO.bufferMinutes,
    );
  }, [duration, date, bookedSlots]);

  const subtitle =
    date && stripName
      ? `${formatDateDisplay(date)} · ${stripName}`
      : date
      ? formatDateDisplay(date)
      : '';

  const handleNext = () => {
    if (!selectedTime || !date || !serviceId) return;
    setBookingTime(selectedTime);
    router.push({
      pathname: '/(client)/booking/confirm',
      params: { date, serviceId, serviceIds, time: selectedTime, totalPrice, totalDuration },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Screen header ─────────────────────────────────────── */}
      <View style={styles.screenHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleBlock}>
          <Text style={styles.screenTitle}>{t('client.booking.selectTime')}</Text>
          {subtitle ? (
            <Text style={styles.screenSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {availableSlots.length === 0 ? (
        /* ── No slots empty state ─────────────────────────────── */
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={52} color={Colors.border} />
          <Text style={styles.emptyTitle}>{t('client.booking.noSlotsForDay')}</Text>
          <Text style={styles.emptySubtitle}>
            Odaberi drugu uslugu ili drugi dan.
          </Text>
          <TouchableOpacity
            style={styles.backToDayBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backToDayText}>{t('client.booking.checkOtherDay')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Service info strip */}
          {stripName ? (
            <View style={styles.serviceStrip}>
              <View style={styles.serviceStripLeft}>
                <Ionicons name="cut-outline" size={16} color={Colors.accent} />
                <Text style={styles.serviceStripName} numberOfLines={1}>
                  {stripName}
                </Text>
              </View>
              <View style={styles.serviceStripRight}>
                <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.serviceStripMeta}>
                  {duration} {t('common.minutes')}
                </Text>
                <Text style={styles.serviceStripDot}>·</Text>
                <Text style={styles.serviceStripPrice}>
                  {totalPrice ? Number(totalPrice) : service?.price ?? ''} {t('common.currency')}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Slots count info */}
          <Text style={styles.slotsCount}>
            {availableSlots.length} slobodn{availableSlots.length === 1 ? 'i termin' : 'ih termina'}
          </Text>

          {/* Slots grid — 3 columns */}
          <View style={styles.slotsGrid}>
            {availableSlots.map((slot) => {
              const isSelected = slot === selectedTime;
              const [h, m] = slot.split(':').map(Number);
              const endMin = h * 60 + m + duration;
              const endLabel = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
              const rangeLabel = `${slot} - ${endLabel}`;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slotCard,
                    isSelected && styles.slotCardSelected,
                  ]}
                  onPress={() =>
                    setSelectedTime((prev) => (prev === slot ? null : slot))
                  }
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.slotTime,
                      isSelected && styles.slotTimeSelected,
                    ]}
                  >
                    {rangeLabel}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={Colors.background}
                      style={styles.slotCheck}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* ── Footer: Dalje button ──────────────────────────────── */}
      {availableSlots.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, !selectedTime && styles.nextBtnDisabled]}
            onPress={handleNext}
            activeOpacity={0.85}
            disabled={!selectedTime}
          >
            <Text
              style={[
                styles.nextBtnText,
                !selectedTime && styles.nextBtnTextDisabled,
              ]}
            >
              {t('common.next')}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={selectedTime ? Colors.background : Colors.textSecondary}
              style={styles.nextBtnIcon}
            />
          </TouchableOpacity>
        </View>
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

  // ── Screen header
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.cardBackground,
  },
  headerTitleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  screenTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  screenSubtitle: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  headerSpacer: { width: 40 },

  // ── Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    opacity: 0.7,
  },
  backToDayBtn: {
    height: 48,
    paddingHorizontal: 28,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  backToDayText: {
    color: Colors.accent,
    fontSize: FontSize.base,
    fontWeight: '600',
  },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
  },

  // ── Service strip
  serviceStrip: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  serviceStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  serviceStripName: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '600',
    flex: 1,
  },
  serviceStripRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceStripMeta: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginLeft: 3,
  },
  serviceStripDot: {
    color: Colors.border,
    fontSize: FontSize.sm,
    marginHorizontal: 2,
  },
  serviceStripPrice: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },

  // ── Slots count
  slotsCount: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: 14,
    letterSpacing: 0.2,
  },

  // ── Slots grid: 3 columns
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotCard: {
    width: '47%',
    height: 52,
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  slotCardSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  slotTime: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  slotTimeSelected: {
    color: Colors.background,
    fontWeight: '700',
  },
  slotCheck: {
    marginLeft: 4,
  },

  // ── Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextBtn: {
    height: 54,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nextBtnText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nextBtnTextDisabled: {
    color: Colors.textSecondary,
  },
  nextBtnIcon: { marginLeft: 8 },
});
