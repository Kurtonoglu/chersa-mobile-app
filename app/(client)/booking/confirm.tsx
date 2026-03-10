import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { parseISO, getDay } from 'date-fns';
import { Colors } from '../../../constants/colors';
import { FontSize } from '../../../constants/typography';
import { t } from '../../../lib/i18n';
import { useAppStore } from '../../../store/useAppStore';

// ── Bosnian date formatting ───────────────────────────────────────────────────

const BS_DAYS = [
  'Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda',
  'Četvrtak', 'Petak', 'Subota',
];

const BS_MONTHS_GEN = [
  'januara', 'februara', 'marta', 'aprila', 'maja', 'juna',
  'jula', 'avgusta', 'septembra', 'oktobra', 'novembra', 'decembra',
];

const formatDateBS = (dateStr: string): string => {
  const d = parseISO(dateStr);
  const dayName = BS_DAYS[getDay(d)];
  const monthName = BS_MONTHS_GEN[d.getMonth()];
  return `${dayName}, ${d.getDate()}. ${monthName} ${d.getFullYear()}.`;
};

// ── Summary row component ─────────────────────────────────────────────────────

interface SummaryRowProps {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
  isLast?: boolean;
}

function SummaryRow({ icon, label, value, valueColor, isLast }: SummaryRowProps) {
  return (
    <View style={[summaryRowStyles.row, !isLast && summaryRowStyles.rowBorder]}>
      <View style={summaryRowStyles.iconWrap}>
        <Ionicons name={icon as never} size={16} color={Colors.accent} />
      </View>
      <Text style={summaryRowStyles.label}>{label}</Text>
      <Text style={[summaryRowStyles.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

const summaryRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(201,168,76,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    flex: 1,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1.4,
    flexWrap: 'wrap',
  },
});

// ── Screen ───────────────────────────────────────────────────────────────────

export default function BookingConfirmScreen() {
  const router = useRouter();
  const { date, serviceId, serviceIds, time, totalPrice, totalDuration } = useLocalSearchParams<{
    date: string;
    serviceId: string;
    serviceIds: string;
    time: string;
    totalPrice: string;
    totalDuration: string;
  }>();

  const language = useAppStore((s) => s.language);
  const services = useAppStore((s) => s.services);
  const currentUser = useAppStore((s) => s.currentUser);
  const addAppointment = useAppStore((s) => s.addAppointment);
  const clearBookingSelection = useAppStore((s) => s.clearBookingSelection);

  useAppStore((s) => s.language); // subscribe for re-renders

  const [confirmed, setConfirmed] = useState(false);

  const service = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId],
  );

  const serviceName = useMemo(() => {
    const ids = serviceIds ? serviceIds.split(',') : serviceId ? [serviceId] : [];
    return ids
      .map((id) => {
        const svc = services.find((s) => s.id === id);
        return svc ? (language === 'en' ? svc.nameEN : svc.nameBS) : null;
      })
      .filter(Boolean)
      .join(' + ');
  }, [serviceIds, serviceId, services, language]);

  const formattedDate = date ? formatDateBS(date) : '';

  const handleConfirm = () => {
    if (!date || !serviceId || !time || !service || confirmed) return;

    setConfirmed(true);

    addAppointment({
      clientName: currentUser.name,
      clientPhone: currentUser.phone || '',
      serviceId,
      date,
      time,
      status: 'pending',
    });

    clearBookingSelection();

    Alert.alert(
      '✓ ' + t('client.booking.successToast'),
      `${serviceName} · ${time}`,
      [
        {
          text: t('common.done'),
          onPress: () => router.replace('/(client)/termini'),
        },
      ],
      { cancelable: false },
    );
  };

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Greška: usluga nije pronađena.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.errorBack}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.screenTitle}>{t('client.booking.confirmBooking')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Confirmation icon ─────────────────────────────────── */}
        <View style={styles.iconSection}>
          <View style={styles.confirmIcon}>
            <Ionicons name="calendar-outline" size={36} color={Colors.accent} />
          </View>
          <Text style={styles.iconSectionTitle}>Provjeri detalje rezervacije</Text>
          <Text style={styles.iconSectionSub}>
            Potvrdi samo ako su sve informacije tačne.
          </Text>
        </View>

        {/* ── Summary card ──────────────────────────────────────── */}
        <View style={styles.summaryCard}>
          {/* Card header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Detalji rezervacije</Text>
          </View>

          <SummaryRow
            icon="cut-outline"
            label={t('client.booking.summary.service')}
            value={serviceName}
          />
          <SummaryRow
            icon="calendar-outline"
            label={t('client.booking.summary.date')}
            value={formattedDate}
          />
          <SummaryRow
            icon="time-outline"
            label={t('client.booking.summary.time')}
            value={time ?? ''}
            valueColor={Colors.accent}
          />
          <SummaryRow
            icon="hourglass-outline"
            label={t('client.booking.summary.duration')}
            value={`${totalDuration ? Number(totalDuration) : service.duration} ${t('common.minutes')}`}
          />
          <SummaryRow
            icon="cash-outline"
            label={t('client.booking.summary.price')}
            value={`${totalPrice ? Number(totalPrice) : service.price} ${t('common.currency')}`}
            valueColor={Colors.accent}
          />
          <SummaryRow
            icon="person-outline"
            label={t('client.booking.summary.clientName')}
            value={currentUser.name}
          />
          <SummaryRow
            icon="call-outline"
            label={t('client.booking.summary.clientPhone')}
            value={currentUser.phone || '—'}
            isLast
          />
        </View>

        {/* ── Status note ───────────────────────────────────────── */}
        <View style={styles.statusNote}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.statusNoteText}>
            Rezervacija će biti na čekanju dok je frizer ne potvrdi.
          </Text>
        </View>
      </ScrollView>

      {/* ── Footer ────────────────────────────────────────────── */}
      <View style={styles.footer}>
        {/* Confirm button */}
        <TouchableOpacity
          style={[styles.confirmBtn, confirmed && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={confirmed}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={confirmed ? Colors.textSecondary : Colors.background}
            style={styles.confirmBtnIcon}
          />
          <Text style={[styles.confirmBtnText, confirmed && styles.confirmBtnTextDisabled]}>
            {t('client.booking.confirmBtn')}
          </Text>
        </TouchableOpacity>

        {/* Back button */}
        <TouchableOpacity
          style={styles.backOutlineBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backOutlineBtnText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
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
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSpacer: { width: 40 },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 20,
  },

  // ── Icon section
  iconSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  confirmIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(201,168,76,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconSectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  iconSectionSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Summary card
  summaryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'rgba(201,168,76,0.05)',
  },
  cardHeaderText: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // ── Status note
  statusNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  statusNoteText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 19,
    flex: 1,
  },

  // ── Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmBtn: {
    height: 56,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmBtnIcon: {
    marginRight: 10,
  },
  confirmBtnText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  confirmBtnTextDisabled: {
    color: Colors.textSecondary,
  },
  backOutlineBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backOutlineBtnText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontWeight: '600',
  },

  // ── Error state
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.base,
  },
  errorBack: {
    color: Colors.accent,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
