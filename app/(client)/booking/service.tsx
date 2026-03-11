import React, { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
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
import { Service, ServiceCategory } from '../../../lib/mockData';

// ── Bosnian date display ─────────────────────────────────────────────────────

const BS_MONTHS_SHORT = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
];

const formatDateDisplay = (dateStr: string): string => {
  const d = parseISO(dateStr);
  return `${d.getDate()}. ${BS_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}.`;
};

// ── Category order and labels ─────────────────────────────────────────────────

const CATEGORY_ORDER: ServiceCategory[] = ['kosa', 'brada', 'paketi'];

// ── Screen ───────────────────────────────────────────────────────────────────

export default function BookingServiceScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();

  const language = useAppStore((s) => s.language);
  const services = useAppStore((s) => s.services);
  const servicesLoading = useAppStore((s) => s.servicesLoading);
  const servicesError = useAppStore((s) => s.servicesError);
  const fetchServicesFromBackend = useAppStore((s) => s.fetchServicesFromBackend);
  const setBookingService = useAppStore((s) => s.setBookingService);

  // Defensive fetch: if the layout's fetch hasn't resolved yet (or was missed
  // via a deep-link), trigger it here so the list isn't permanently blank.
  useEffect(() => {
    if (services.length === 0) {
      fetchServicesFromBackend();
    }
  }, []);

  const [selectedKosa,  setSelectedKosa]  = React.useState<string | null>(null);
  const [selectedBrada, setSelectedBrada] = React.useState<string | null>(null);
  const [selectedPaket, setSelectedPaket] = React.useState<string | null>(null);

  const paketActive = selectedPaket !== null;

  const handleSelect = (svc: Service) => {
    if (svc.category === 'paketi') {
      setSelectedPaket((prev) => (prev === svc.id ? null : svc.id));
      setSelectedKosa(null);
      setSelectedBrada(null);
    } else if (svc.category === 'kosa') {
      setSelectedKosa((prev) => (prev === svc.id ? null : svc.id));
      setSelectedPaket(null);
    } else if (svc.category === 'brada') {
      setSelectedBrada((prev) => (prev === svc.id ? null : svc.id));
      setSelectedPaket(null);
    }
  };

  const getServiceName = (svc: Service) =>
    language === 'en' ? svc.nameEN : svc.nameBS;

  const getCategoryLabel = (cat: ServiceCategory) => {
    switch (cat) {
      case 'kosa':   return t('client.booking.categories.kosa');
      case 'brada':  return t('client.booking.categories.brada');
      case 'paketi': return t('client.booking.categories.paketi');
    }
  };

  const selectedIds = [selectedKosa, selectedBrada, selectedPaket].filter(
    (id): id is string => id !== null,
  );

  const totalPrice = selectedIds.reduce((sum, id) => {
    const svc = services.find((s) => s.id === id);
    return sum + (svc?.price ?? 0);
  }, 0);

  const totalDuration = selectedIds.reduce((sum, id) => {
    const svc = services.find((s) => s.id === id);
    return sum + (svc?.duration ?? 0);
  }, 0);

  const canProceed = selectedIds.length > 0 && totalDuration > 0;

  const handleNext = () => {
    if (!canProceed || !date) return;
    const serviceId = selectedIds[0];
    setBookingService(serviceId);
    router.push({
      pathname: '/(client)/booking/time',
      params: { date, serviceId, serviceIds: selectedIds.join(','), totalPrice: String(totalPrice), totalDuration: String(totalDuration) },
    });
  };

  const activeServices = services.filter((s) => s.active);

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
          <Text style={styles.screenTitle}>{t('client.booking.selectService')}</Text>
          {date ? (
            <Text style={styles.screenSubtitle}>{formatDateDisplay(date)}</Text>
          ) : null}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {servicesLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : services.length === 0 ? (
        <View style={styles.loadingState}>
          <Text style={styles.errorText}>
            {t('client.booking.servicesError')}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchServicesFromBackend}>
            <Text style={styles.retryBtnText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORY_ORDER.map((category) => {
          const catServices = activeServices.filter((s) => s.category === category);
          if (catServices.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              {/* Category header */}
              <View style={styles.categoryHeader}>
                <View style={styles.categoryLine} />
                <Text style={styles.categoryLabel}>
                  {getCategoryLabel(category)}
                </Text>
                <View style={styles.categoryLine} />
              </View>

              {catServices.map((svc) => {
                const isDisabledByPaket = paketActive && svc.category !== 'paketi';
                const isSelected =
                  (svc.category === 'kosa'   && selectedKosa  === svc.id) ||
                  (svc.category === 'brada'  && selectedBrada === svc.id) ||
                  (svc.category === 'paketi' && selectedPaket === svc.id);

                return (
                  <TouchableOpacity
                    key={svc.id}
                    style={[
                      styles.serviceCard,
                      isSelected && styles.serviceCardSelected,
                      isDisabledByPaket && styles.serviceCardDimmed,
                    ]}
                    onPress={() => {
                      if (isDisabledByPaket) return;
                      handleSelect(svc);
                    }}
                    activeOpacity={isDisabledByPaket ? 1 : 0.75}
                  >
                    {/* Top row: name + price */}
                    <View style={styles.serviceRow}>
                      <Text style={styles.serviceName} numberOfLines={2}>
                        {getServiceName(svc)}
                      </Text>
                      <Text style={styles.servicePrice}>
                        {svc.price} {t('common.currency')}
                      </Text>
                    </View>

                    {/* Bottom row: duration + checkmark */}
                    <View style={styles.serviceFooter}>
                      <View style={styles.durationRow}>
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.durationText}>
                          {svc.duration} {t('common.minutes')}
                        </Text>
                      </View>

                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={Colors.accent}
                        />
                      )}
                    </View>

                    {/* Description (packages only) */}
                    {svc.description != null && (
                      <Text style={styles.serviceDescription}>
                        {svc.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
      )}

      {/* ── Footer: Dalje button ──────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={!canProceed}
        >
          <Text style={[styles.nextBtnText, !canProceed && styles.nextBtnTextDisabled]}>
            {t('common.next')}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={canProceed ? Colors.background : Colors.textSecondary}
            style={styles.nextBtnIcon}
          />
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
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },

  // ── Loading / Error
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  retryBtnText: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },

  // ── Category section
  categorySection: {
    marginTop: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  categoryLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  categoryLabel: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // ── Service card
  serviceCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 10,
  },
  serviceCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(201,168,76,0.06)',
  },
  serviceCardDimmed: {
    opacity: 0.45,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 12,
  },
  serviceName: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '600',
    flex: 1,
    lineHeight: 21,
  },
  servicePrice: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: '700',
    minWidth: 56,
    textAlign: 'right',
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  serviceDescription: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    lineHeight: 17,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
