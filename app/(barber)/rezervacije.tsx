import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { confirm } from '../../lib/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';
import { Appointment, AppointmentStatus, Service } from '../../lib/mockData';

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterType = 'all' | AppointmentStatus;

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

// ── Appointment card ───────────────────────────────────────────────────────────

interface AptCardProps {
  appointment: Appointment;
  serviceName: string;
  servicePrice: number;
  onCancel: () => void;
}

function AptCard({ appointment, serviceName, servicePrice, onCancel }: AptCardProps) {
  const isCancelled = appointment.status === 'cancelled';
  const statusColor = STATUS_COLOR[appointment.status] ?? Colors.border;

  return (
    <View style={[aptCard.container, { borderLeftColor: statusColor }]}>
      {/* Top row: date/time + status badge */}
      <View style={aptCard.topRow}>
        <View>
          <Text style={aptCard.dateText}>
            {format(parseISO(appointment.date), 'd. MM. yyyy')}
          </Text>
          <Text style={aptCard.timeText}>{appointment.time}</Text>
        </View>
        <View style={[aptCard.statusBadge, { backgroundColor: `${statusColor}22` }]}>
          <Text style={[aptCard.statusText, { color: statusColor }]}>
            {t(STATUS_LABEL[appointment.status] ?? 'status.pending')}
          </Text>
        </View>
      </View>

      {/* Client info */}
      <Text style={aptCard.clientName}>{appointment.clientName}</Text>
      <Text style={aptCard.clientPhone}>{appointment.clientPhone}</Text>

      {/* Service + price */}
      <View style={aptCard.serviceRow}>
        <Text style={aptCard.serviceName}>{serviceName}</Text>
        <Text style={aptCard.price}>{servicePrice} {t('common.currency')}</Text>
      </View>

      {/* Cancel button */}
      {!isCancelled && (
        <TouchableOpacity
          style={aptCard.cancelBtn}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text style={aptCard.cancelBtnText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const aptCard = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    padding: 14,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dateText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  timeText: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  clientName: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '700',
    marginBottom: 2,
  },
  clientPhone: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: 8,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    flex: 1,
  },
  price: {
    color: Colors.accent,
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  cancelBtn: {
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

// ── Walk-in modal ─────────────────────────────────────────────────────────────

interface WalkInModalProps {
  visible: boolean;
  services: Service[];
  onClose: () => void;
  onSave: (data: {
    clientName: string;
    clientPhone: string;
    serviceId: string;
    date: string;
    time: string;
  }) => void;
}

function WalkInModal({ visible, services, onClose, onSave }: WalkInModalProps) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('09:00');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!clientName.trim()) e.clientName = 'Unesi ime klijenta';
    if (!clientPhone.trim()) e.clientPhone = 'Unesi broj telefona';
    if (!selectedServiceId) e.service = 'Odaberi uslugu';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) e.date = 'Format: YYYY-MM-DD';
    if (!/^\d{2}:\d{2}$/.test(time)) e.time = 'Format: HH:MM';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ clientName: clientName.trim(), clientPhone: clientPhone.trim(), serviceId: selectedServiceId, date, time });
    // Reset
    setClientName('');
    setClientPhone('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime('09:00');
    setSelectedServiceId('');
    setErrors({});
  };

  const handleClose = () => {
    setClientName('');
    setClientPhone('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime('09:00');
    setSelectedServiceId('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
          {/* Header */}
          <View style={wm.header}>
            <TouchableOpacity onPress={handleClose} style={wm.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={wm.title}>{t('barber.rezervacije.addNew')}</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            contentContainerStyle={wm.body}
            keyboardShouldPersistTaps="handled"
          >
            {/* Client name */}
            <Text style={wm.label}>{t('barber.rezervacije.clientName')}</Text>
            <TextInput
              style={[wm.input, errors.clientName ? wm.inputError : null]}
              value={clientName}
              onChangeText={setClientName}
              placeholder="Npr. Adnan Begović"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="words"
            />
            {errors.clientName ? <Text style={wm.error}>{errors.clientName}</Text> : null}

            {/* Client phone */}
            <Text style={wm.label}>{t('barber.rezervacije.clientPhone')}</Text>
            <TextInput
              style={[wm.input, errors.clientPhone ? wm.inputError : null]}
              value={clientPhone}
              onChangeText={setClientPhone}
              placeholder="061 000 000"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="phone-pad"
            />
            {errors.clientPhone ? <Text style={wm.error}>{errors.clientPhone}</Text> : null}

            {/* Service selector */}
            <Text style={wm.label}>{t('barber.rezervacije.selectService')}</Text>
            <TouchableOpacity
              style={[wm.input, wm.selector, errors.service ? wm.inputError : null]}
              onPress={() => setShowServicePicker(!showServicePicker)}
              activeOpacity={0.8}
            >
              <Text style={selectedService ? wm.selectorText : wm.selectorPlaceholder}>
                {selectedService ? selectedService.nameBS : t('barber.rezervacije.selectService')}
              </Text>
              <Ionicons
                name={showServicePicker ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
            {errors.service ? <Text style={wm.error}>{errors.service}</Text> : null}

            {/* Service dropdown */}
            {showServicePicker && (
              <View style={wm.pickerList}>
                {services.filter((s) => s.active).map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      wm.pickerItem,
                      s.id === selectedServiceId && wm.pickerItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedServiceId(s.id);
                      setShowServicePicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={wm.pickerItemText}>{s.nameBS}</Text>
                    <Text style={wm.pickerItemMeta}>
                      {s.duration} {t('common.minutes')} · {s.price} {t('common.currency')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Date */}
            <Text style={wm.label}>{t('barber.rezervacije.selectDate')}</Text>
            <TextInput
              style={[wm.input, errors.date ? wm.inputError : null]}
              value={date}
              onChangeText={setDate}
              placeholder="2026-03-15"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />
            {errors.date ? <Text style={wm.error}>{errors.date}</Text> : null}

            {/* Time */}
            <Text style={wm.label}>{t('barber.rezervacije.selectTime')}</Text>
            <TextInput
              style={[wm.input, errors.time ? wm.inputError : null]}
              value={time}
              onChangeText={setTime}
              placeholder="09:00"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />
            {errors.time ? <Text style={wm.error}>{errors.time}</Text> : null}
          </ScrollView>

          {/* Save button */}
          <View style={wm.footer}>
            <TouchableOpacity style={wm.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={wm.saveBtnText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const wm = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 50,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    color: Colors.error,
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
  },
  selectorPlaceholder: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
  },
  pickerList: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemSelected: {
    backgroundColor: `${Colors.accent}18`,
  },
  pickerItemText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  pickerItemMeta: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    height: 52,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});

// ── Filter chips ──────────────────────────────────────────────────────────────

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'barber.rezervacije.all' },
  { key: 'confirmed', label: 'barber.rezervacije.confirmed' },
  { key: 'pending', label: 'barber.rezervacije.pending' },
  { key: 'cancelled', label: 'barber.rezervacije.cancelled' },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function RezervacijeScreen() {
  const language = useAppStore((s) => s.language);
  const appointments = useAppStore((s) => s.appointments);
  const services = useAppStore((s) => s.services);
  const cancelAppointment = useAppStore((s) => s.cancelAppointment);
  const addAppointment = useAppStore((s) => s.addAppointment);

  void language;

  const [filter, setFilter] = useState<FilterType>('all');
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = appointments
    .filter((a) => filter === 'all' || a.status === filter)
    .sort((a, b) => {
      const da = `${a.date} ${a.time}`;
      const db = `${b.date} ${b.time}`;
      return db.localeCompare(da); // newest first
    });

  const getService = (id: string) => services.find((s) => s.id === id);

  const handleCancel = (id: string) => {
    confirm(
      t('barber.rezervacije.cancelTitle'),
      t('barber.rezervacije.cancelMessage'),
      {
        cancelText: t('common.no'),
        confirmText: t('common.yes'),
        destructive: true,
        onConfirm: () => cancelAppointment(id),
      },
    );
  };

  const handleAddWalkIn = (data: {
    clientName: string;
    clientPhone: string;
    serviceId: string;
    date: string;
    time: string;
  }) => {
    addAppointment({
      ...data,
      status: 'confirmed',
    });
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page header ─────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{t('barber.rezervacije.title')}</Text>
      </View>

      {/* ── Filter chips ─────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
              {t(f.label)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Appointment list ────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const svc = getService(item.serviceId);
          return (
            <AptCard
              appointment={item}
              serviceName={svc?.nameBS ?? '—'}
              servicePrice={svc?.price ?? 0}
              onCancel={() => handleCancel(item.id)}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="calendar-outline" size={48} color={Colors.accent} style={{ opacity: 0.4 }} />
            <Text style={styles.emptyText}>{t('barber.rezervacije.noReservations')}</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* ── Floating + button ─────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.background} />
      </TouchableOpacity>

      {/* ── Walk-in modal ──────────────────────────────────────────── */}
      <WalkInModal
        visible={modalVisible}
        services={services}
        onClose={() => setModalVisible(false)}
        onSave={handleAddWalkIn}
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

  filterScroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.background,
  },

  listContent: {
    padding: 16,
    paddingBottom: 100,
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
  },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
