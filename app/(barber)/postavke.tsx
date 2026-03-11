import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { confirm } from '../../lib/alert';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';

const MOCK_PIN = '123456';

// ── Working days state ────────────────────────────────────────────────────────

const DAYS = [
  { key: 'mon', label: 'barber.postavke.days.mon' },
  { key: 'tue', label: 'barber.postavke.days.tue' },
  { key: 'wed', label: 'barber.postavke.days.wed' },
  { key: 'thu', label: 'barber.postavke.days.thu' },
  { key: 'fri', label: 'barber.postavke.days.fri' },
  { key: 'sat', label: 'barber.postavke.days.sat' },
  { key: 'sun', label: 'barber.postavke.days.sun' },
];

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={secStyles.header}>{title}</Text>;
}

const secStyles = StyleSheet.create({
  header: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function BarberPostavkeScreen() {
  const router = useRouter();
  const language = useAppStore((s) => s.language);
  const setBarberAuthenticated = useAppStore((s) => s.setBarberAuthenticated);

  void language;

  // ── Working hours state (local — no persistent shop store yet)
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('18:00');
  const [editingHours, setEditingHours] = useState(false);

  // ── Working days state (Mon=true, Sun=false by default)
  const [workingDays, setWorkingDays] = useState<Record<string, boolean>>({
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
    sun: false,
  });

  // ── PIN change state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [mockPin, setMockPin] = useState(MOCK_PIN);

  // ── Notifications toggle
  const [notifEnabled, setNotifEnabled] = useState(true);

  const toggleDay = (key: string) =>
    setWorkingDays((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSaveHours = () => {
    setEditingHours(false);
    Alert.alert('Sačuvano', `Radno vrijeme: ${openTime} – ${closeTime}`);
  };

  const handleChangePin = () => {
    setPinError('');
    setPinSuccess('');

    if (currentPin !== mockPin) {
      setPinError(t('barber.postavke.pinWrong'));
      return;
    }
    if (!newPin || newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      setPinError('Novi PIN mora imati točno 6 cifara.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError(t('barber.postavke.pinMismatch'));
      return;
    }

    setMockPin(newPin);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinSuccess(t('barber.postavke.pinSaved'));
  };

  const handleLogout = () => {
    confirm(
      t('barber.postavke.logoutTitle'),
      t('barber.postavke.logoutMessage'),
      {
        cancelText: t('common.cancel'),
        confirmText: t('barber.postavke.logout'),
        destructive: true,
        onConfirm: () => {
          setBarberAuthenticated(false);
          router.replace('/(client)/pocetna');
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page header ─────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{t('barber.postavke.title')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Working hours ─────────────────────────────────────── */}
        <SectionHeader title={t('barber.postavke.workingHours')} />
        <View style={styles.card}>
          {editingHours ? (
            <View style={styles.hoursEdit}>
              <View style={styles.hoursRow}>
                <View style={styles.hoursField}>
                  <Text style={styles.hoursLabel}>{t('barber.postavke.openTime')}</Text>
                  <TextInput
                    style={styles.hoursInput}
                    value={openTime}
                    onChangeText={setOpenTime}
                    placeholder="09:00"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.hoursSep}>–</Text>
                <View style={styles.hoursField}>
                  <Text style={styles.hoursLabel}>{t('barber.postavke.closeTime')}</Text>
                  <TextInput
                    style={styles.hoursInput}
                    value={closeTime}
                    onChangeText={setCloseTime}
                    placeholder="18:00"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.saveSmallBtn} onPress={handleSaveHours}>
                <Text style={styles.saveSmallBtnText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.hoursDisplay}
              onPress={() => setEditingHours(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={20} color={Colors.accent} />
              <Text style={styles.hoursDisplayText}>
                {openTime} – {closeTime}
              </Text>
              <Ionicons name="pencil-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Working days ──────────────────────────────────────── */}
        <SectionHeader title={t('barber.postavke.workingDays')} />
        <View style={styles.card}>
          <View style={styles.daysGrid}>
            {DAYS.map(({ key, label }) => {
              const active = workingDays[key];
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.dayChip, active && styles.dayChipActive]}
                  onPress={() => toggleDay(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                    {t(label)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── PIN change ────────────────────────────────────────── */}
        <SectionHeader title={t('barber.postavke.changePin')} />
        <View style={[styles.card, styles.cardPad]}>
          {/* Current PIN */}
          <Text style={styles.pinLabel}>{t('barber.postavke.currentPin')}</Text>
          <TextInput
            style={styles.pinInput}
            value={currentPin}
            onChangeText={(v) => { setCurrentPin(v); setPinError(''); setPinSuccess(''); }}
            placeholder="••••••"
            placeholderTextColor={Colors.textSecondary}
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
          />

          {/* New PIN */}
          <Text style={styles.pinLabel}>{t('barber.postavke.newPin')}</Text>
          <TextInput
            style={styles.pinInput}
            value={newPin}
            onChangeText={(v) => { setNewPin(v); setPinError(''); setPinSuccess(''); }}
            placeholder="••••••"
            placeholderTextColor={Colors.textSecondary}
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
          />

          {/* Confirm PIN */}
          <Text style={styles.pinLabel}>{t('barber.postavke.confirmPin')}</Text>
          <TextInput
            style={styles.pinInput}
            value={confirmPin}
            onChangeText={(v) => { setConfirmPin(v); setPinError(''); setPinSuccess(''); }}
            placeholder="••••••"
            placeholderTextColor={Colors.textSecondary}
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
          />

          {/* Feedback */}
          {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
          {pinSuccess ? <Text style={styles.pinSuccess}>{pinSuccess}</Text> : null}

          {/* Save PIN */}
          <TouchableOpacity
            style={styles.pinSaveBtn}
            onPress={handleChangePin}
            activeOpacity={0.85}
          >
            <Text style={styles.pinSaveBtnText}>{t('barber.postavke.savePin')}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Notifications ─────────────────────────────────────── */}
        <SectionHeader title={t('barber.postavke.notifications')} />
        <View style={styles.card}>
          <View style={styles.notifRow}>
            <Ionicons name="notifications-outline" size={20} color={Colors.accent} />
            <Text style={styles.notifLabel}>{t('barber.postavke.notifications')}</Text>
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.background}
              ios_backgroundColor={Colors.border}
            />
          </View>
        </View>

        {/* ── Logout ────────────────────────────────────────────── */}
        <SectionHeader title="Barber mod" />
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>{t('barber.postavke.logout')}</Text>
          </TouchableOpacity>
        </View>

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
  pageTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardPad: {
    padding: 16,
  },

  // ── Working hours
  hoursEdit: {
    padding: 16,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 12,
  },
  hoursField: { flex: 1 },
  hoursLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginBottom: 6,
  },
  hoursInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 46,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '600',
    textAlign: 'center',
  },
  hoursSep: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    paddingBottom: 10,
  },
  saveSmallBtn: {
    height: 42,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveSmallBtnText: {
    color: Colors.background,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  hoursDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  hoursDisplayText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '600',
  },

  // ── Working days
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
  dayChip: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: `${Colors.accent}22`,
    borderColor: Colors.accent,
  },
  dayChipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  dayChipTextActive: {
    color: Colors.accent,
  },

  // ── PIN
  pinLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
  },
  pinInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 50,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    letterSpacing: 4,
  },
  pinError: {
    color: Colors.error,
    fontSize: FontSize.sm,
    marginTop: 10,
  },
  pinSuccess: {
    color: Colors.success,
    fontSize: FontSize.sm,
    marginTop: 10,
  },
  pinSaveBtn: {
    height: 48,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  pinSaveBtnText: {
    color: Colors.background,
    fontSize: FontSize.base,
    fontWeight: '700',
  },

  // ── Notifications
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  notifLabel: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '500',
  },

  // ── Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSize.base,
    fontWeight: '600',
  },

  bottomSpacer: { height: 40 },
});
