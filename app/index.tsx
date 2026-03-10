import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { FontSize } from '../constants/typography';
import { t } from '../lib/i18n';
import { useAppStore } from '../store/useAppStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const isHydrating = useAppStore((s) => s.isHydrating);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  // Redirect once hydration is done and user is confirmed logged in
  useEffect(() => {
  if (!isHydrating && currentUser.isLoggedIn) {
    router.replace('/(client)/pocetna');
  }
}, [isHydrating, currentUser.isLoggedIn]);

  const toggleLanguage = () => {
    setLanguage(language === 'bs' ? 'en' : 'bs');
  };

  if (isHydrating) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.accent} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar — language toggle */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={toggleLanguage}
          style={styles.langToggle}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.langToggleActive}>
            {language === 'bs' ? 'BA' : 'EN'}
          </Text>
          <Text style={styles.langDivider}> / </Text>
          <Text style={styles.langToggleInactive}>
            {language === 'bs' ? 'EN' : 'BA'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Center — logo + name + tagline */}
      <View style={styles.centerContent}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>C</Text>
        </View>

        <Text style={styles.shopName}>{t('common.appName')}</Text>
        <Text style={styles.tagline}>{t('common.tagline')}</Text>
      </View>

      {/* Bottom — action buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.outlinedButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.outlinedButtonText}>{t('onboarding.login')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filledButton}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.8}
        >
          <Text style={styles.filledButtonText}>{t('onboarding.register')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Top bar ─────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  langToggleActive: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  langDivider: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  langToggleInactive: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '500',
    letterSpacing: 1,
  },

  // ── Center content ──────────────────────────────────────────────────────────
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  logoLetter: {
    color: Colors.accent,
    fontSize: 64,
    fontWeight: '700',
    lineHeight: 72,
  },
  shopName: {
    color: Colors.accent,
    fontSize: FontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.4,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // ── Buttons ─────────────────────────────────────────────────────────────────
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  outlinedButton: {
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedButtonText: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  filledButton: {
    height: 52,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledButtonText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
