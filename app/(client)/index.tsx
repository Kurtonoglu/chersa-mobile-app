import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';

export default function HomeScreen() {
  const router = useRouter();
  // Subscribe to language so all t() calls re-render on language switch
  useAppStore((s) => s.language);

  const handlePhonePress = () => {
    Alert.alert(
      t('client.home.callAction'),
      undefined,
      [
        {
          text: t('common.call'),
          onPress: () => Linking.openURL('tel:+38762906329'),
        },
        {
          text: t('common.viber'),
          onPress: () => Linking.openURL('viber://chat?number=38762906329'),
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const handleInstagramPress = () => {
    Linking.openURL('https://www.instagram.com/frizerski_salon_chersa').catch(
      () => Linking.openURL('https://instagram.com/frizerski_salon_chersa'),
    );
  };

  const handleMapsPress = () => {
    Linking.openURL('https://www.google.com/maps?q=44.2269016,17.6623864');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Atmospheric header ─────────────────────────────────────── */}
        <View style={styles.header}>
          {/* Subtle radial glow behind logo */}
          <View style={styles.glowRing} />

          {/* Logo circle */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>C</Text>
          </View>

          {/* Shop name */}
          <Text style={styles.shopName}>{t('common.appName')}</Text>
        </View>

        {/* ── REZERVIŠI button ───────────────────────────────────────── */}
        <View style={styles.reserveWrapper}>
          <TouchableOpacity
            style={styles.reserveButton}
            onPress={() => router.push('/(client)/booking/date')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="calendar"
              size={20}
              color={Colors.background}
              style={styles.reserveIcon}
            />
            <Text style={styles.reserveText}>{t('client.home.reserveBtn')}</Text>
          </TouchableOpacity>
        </View>

        {/* ── O nama ────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('client.home.aboutTitle')}</Text>
          <Text style={styles.aboutText}>{t('client.home.aboutText')}</Text>
        </View>

        {/* ── Kontakt ───────────────────────────────────────────────── */}
        <View style={[styles.card, styles.contactCard]}>
          <Text style={[styles.sectionTitle, styles.contactTitle]}>
            {t('client.home.contactTitle')}
          </Text>

          {/* Phone row */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={handlePhonePress}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconWrap}>
              <Ionicons name="call-outline" size={18} color={Colors.accent} />
            </View>
            <Text style={styles.contactText}>{t('client.home.phone')}</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Instagram row */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={handleInstagramPress}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconWrap}>
              <Ionicons name="logo-instagram" size={18} color={Colors.accent} />
            </View>
            <Text style={styles.contactText}>{t('client.home.instagram')}</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Maps row */}
          <TouchableOpacity
            style={[styles.contactRow, styles.contactRowLast]}
            onPress={handleMapsPress}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconWrap}>
              <Ionicons name="location-outline" size={18} color={Colors.accent} />
            </View>
            <Text style={styles.contactText}>{t('client.home.address')}</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 36,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#131313',
    overflow: 'hidden',
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.accent,
    opacity: 0.04,
    top: -20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    backgroundColor: 'rgba(201,168,76,0.06)',
  },
  logoLetter: {
    color: Colors.accent,
    fontSize: 52,
    fontWeight: '700',
    lineHeight: 60,
  },
  shopName: {
    color: Colors.accent,
    fontSize: FontSize.xl,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  // ── REZERVIŠI ───────────────────────────────────────────────────────────────
  reserveWrapper: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 8,
  },
  reserveButton: {
    height: 58,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reserveIcon: {
    marginRight: 10,
  },
  reserveText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: 2.5,
  },

  // ── Cards ────────────────────────────────────────────────────────────────────
  card: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  aboutText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    lineHeight: 22,
  },

  // ── Contact ──────────────────────────────────────────────────────────────────
  contactCard: {
    padding: 0,
    overflow: 'hidden',
  },
  contactTitle: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    marginBottom: 0,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 52,
  },
  contactRowLast: {
    // no border at bottom
  },
  contactIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(201,168,76,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactText: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    flex: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },

});
