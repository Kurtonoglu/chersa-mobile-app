import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';
import { useRouter } from 'expo-router';

// ── Settings row component ────────────────────────────────────────────────────

interface SettingsRowProps {
  icon: string;
  iconColor?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  showChevron?: boolean;
  isLast?: boolean;
}

function SettingsRow({
  icon,
  iconColor,
  label,
  value,
  onPress,
  rightElement,
  destructive,
  showChevron = true,
  isLast,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={[rowStyles.row, !isLast && rowStyles.rowBorder]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightElement}
    >
      <View style={[rowStyles.iconWrap, { backgroundColor: `${iconColor ?? Colors.accent}18` }]}>
        <Ionicons
          name={icon as never}
          size={18}
          color={iconColor ?? Colors.accent}
        />
      </View>

      <View style={rowStyles.labelWrap}>
        <Text style={[rowStyles.label, destructive && rowStyles.labelDestructive]}>
          {label}
        </Text>
        {value ? <Text style={rowStyles.value}>{value}</Text> : null}
      </View>

      {rightElement ?? (
        showChevron ? (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.textSecondary}
          />
        ) : null
      )}
    </TouchableOpacity>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  labelDestructive: {
    color: Colors.error,
  },
  value: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={sectionStyles.header}>{title}</Text>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 6,
  },
});

// ── Profile edit modal ────────────────────────────────────────────────────────

interface ProfileModalProps {
  visible: boolean;
  name: string;
  phone: string;
  onChangeName: (v: string) => void;
  onChangePhone: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}

function ProfileModal({
  visible,
  name,
  phone,
  onChangeName,
  onChangePhone,
  onSave,
  onClose,
}: ProfileModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={modalStyles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={modalStyles.container}>
          {/* Header */}
          <View style={modalStyles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={modalStyles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={modalStyles.title}>{t('client.postavke.editProfileTitle')}</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            contentContainerStyle={modalStyles.body}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name field */}
            <Text style={modalStyles.label}>{t('client.postavke.nameLabel')}</Text>
            <TextInput
              style={modalStyles.input}
              value={name}
              onChangeText={onChangeName}
              placeholder="Ime i prezime"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="words"
              returnKeyType="next"
            />

            {/* Phone field */}
            <Text style={modalStyles.label}>{t('client.postavke.phoneLabel')}</Text>
            <TextInput
              style={modalStyles.input}
              value={phone}
              onChangeText={onChangePhone}
              placeholder="+38762000000"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="phone-pad"
              returnKeyType="done"
            />
          </ScrollView>

          {/* Save button */}
          <View style={modalStyles.footer}>
            <TouchableOpacity
              style={modalStyles.saveBtn}
              onPress={onSave}
              activeOpacity={0.85}
            >
              <Text style={modalStyles.saveBtnText}>
                {t('client.postavke.saveProfile')}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
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
    paddingTop: 24,
    paddingBottom: 16,
    gap: 6,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
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

// ── About modal ───────────────────────────────────────────────────────────────

function AboutModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={aboutStyles.container}>
        <View style={aboutStyles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={aboutStyles.closeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={aboutStyles.title}>{t('client.postavke.about')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={aboutStyles.body}>
          {/* Logo */}
          <View style={aboutStyles.logoCircle}>
            <Text style={aboutStyles.logoLetter}>C</Text>
          </View>
          <Text style={aboutStyles.appName}>{t('common.appName')}</Text>
          <Text style={aboutStyles.version}>{t('client.postavke.version')}</Text>

          <View style={aboutStyles.divider} />

          {/* Instagram link */}
          <TouchableOpacity
            style={aboutStyles.linkRow}
            onPress={() =>
              Linking.openURL(
                'https://www.instagram.com/frizerski_salon_chersa',
              )
            }
            activeOpacity={0.7}
          >
            <Ionicons name="logo-instagram" size={20} color={Colors.accent} />
            <Text style={aboutStyles.linkText}>
              {t('client.postavke.instagram')} — @frizerski_salon_chersa
            </Text>
          </TouchableOpacity>

          <View style={aboutStyles.divider} />

          <Text style={aboutStyles.footer}>
            Izgrađeno s ljubavlju za Travnik. {'\n'}
            © 2026 Frizerski salon Chersa
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const aboutStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,168,76,0.06)',
    marginBottom: 8,
  },
  logoLetter: {
    color: Colors.accent,
    fontSize: 44,
    fontWeight: '700',
    lineHeight: 52,
  },
  appName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  version: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  linkText: {
    color: Colors.accent,
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  footer: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
});

// ── Screen ───────────────────────────────────────────────────────────────────

export default function PostavkeScreen() {
  const router = useRouter();
  const language = useAppStore((s) => s.language);
  const currentUser = useAppStore((s) => s.currentUser);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setUser = useAppStore((s) => s.setUser);
  const logoutUser = useAppStore((s) => s.logout);

  // Local UI state
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  // Profile edit form state — kept in sync when modal opens
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone);

  const openProfileModal = () => {
    setEditName(currentUser.name);
    setEditPhone(currentUser.phone);
    setProfileModalVisible(true);
  };

  const handleSaveProfile = () => {
    const trimmedName = editName.trim();
    const trimmedPhone = editPhone.trim();
    if (!trimmedName) return;
    setUser({ name: trimmedName, phone: trimmedPhone, isLoggedIn: true });
    setProfileModalVisible(false);
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'bs' ? 'en' : 'bs');
  };

  const handleLogout = () => {
  Alert.alert(
    'Odjava',
    'Jesi li siguran da se želiš odjaviti?',
    [
      { text: 'Ne', style: 'cancel' },
      {
        text: 'Da',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          logoutUser();
          router.replace('/');
        },
      },
    ],
  );
};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Screen header ─────────────────────────────────────── */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>{t('client.postavke.title')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── User info card ────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.userCard}
          onPress={openProfileModal}
          activeOpacity={0.8}
        >
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarLetter}>
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {currentUser.name}
            </Text>
            <Text style={styles.userPhone}>
              {currentUser.phone || '—'}
            </Text>
          </View>
          <Ionicons name="pencil-outline" size={18} color={Colors.accent} />
        </TouchableOpacity>

        {/* ── Preferences section ───────────────────────────────── */}
        <SectionHeader title="Postavke" />
        <View style={styles.card}>
          <SettingsRow
            icon="person-outline"
            label={t('client.postavke.profile')}
            value={currentUser.name}
            onPress={openProfileModal}
          />

          <SettingsRow
            icon="notifications-outline"
            label={t('client.postavke.notifications')}
            showChevron={false}
            rightElement={
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: Colors.border, true: Colors.accent }}
                thumbColor={Colors.background}
                ios_backgroundColor={Colors.border}
              />
            }
          />

          <SettingsRow
            icon="globe-outline"
            label={t('client.postavke.language')}
            value={language === 'bs' ? 'Bosanski (BA)' : 'English (EN)'}
            onPress={handleLanguageToggle}
            isLast
          />
        </View>

        {/* ── About section ─────────────────────────────────────── */}
        <SectionHeader title="Informacije" />
        <View style={styles.card}>
          <SettingsRow
            icon="information-circle-outline"
            label={t('client.postavke.about')}
            value={t('client.postavke.version')}
            onPress={() => setAboutModalVisible(true)}
            isLast
          />
        </View>

        {/* ── Logout ────────────────────────────────────────────── */}
        <SectionHeader title="Račun" />
        <View style={styles.card}>
          <SettingsRow
            icon="log-out-outline"
            iconColor={Colors.error}
            label={t('client.postavke.logout')}
            destructive
            onPress={handleLogout}
            showChevron={false}
            isLast
          />
        </View>

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Profile modal ─────────────────────────────────────── */}
      <ProfileModal
        visible={profileModalVisible}
        name={editName}
        phone={editPhone}
        onChangeName={setEditName}
        onChangePhone={setEditPhone}
        onSave={handleSaveProfile}
        onClose={() => setProfileModalVisible(false)}
      />

      {/* ── About modal ───────────────────────────────────────── */}
      <AboutModal
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
      />
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

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 0,
  },

  // ── User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginTop: 8,
    gap: 14,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarLetter: {
    color: Colors.accent,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '700',
    marginBottom: 3,
  },
  userPhone: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },

  // ── Section card
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },

  bottomSpacer: {
    height: 40,
  },
});
