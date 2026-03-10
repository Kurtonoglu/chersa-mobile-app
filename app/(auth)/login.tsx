import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';
import { loginWithPhone } from '../../services/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginForm {
  phone: string;
  password: string;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ defaultValues: { phone: '', password: '' } });

  // ── Submit: authenticate via Supabase → store → navigate ───────────────────
  const onLogin = handleSubmit(async ({ phone, password }) => {
    setLoginError(null);
    setLoading(true);
    const { data, error } = await loginWithPhone(`+387${phone.replace(/\s/g, '')}`, password);
    setLoading(false);
    if (error || !data) {
      setLoginError(error ?? 'Login failed. Please try again.');
      return;
    }
    setUser({ name: data.name, phone: data.phone, isLoggedIn: true });
    router.replace('/(client)');
  });

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back arrow */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>← {t('common.back')}</Text>
          </TouchableOpacity>

          {/* Shop name header */}
          <Text style={styles.shopName}>{t('common.appName')}</Text>
          <Text style={styles.screenTitle}>{t('auth.login.title')}</Text>

          <View style={styles.formContainer}>
            {/* Phone field */}
            <Text style={styles.label}>{t('auth.login.phoneLabel')}</Text>
            <View
              style={[
                styles.phoneRow,
                focusedField === 'phone' && styles.inputFocused,
                errors.phone && styles.phoneRowError,
              ]}
            >
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>{t('auth.login.phonePrefix')}</Text>
              </View>
              <Controller
                control={control}
                name="phone"
                rules={{
                  required: t('auth.validation.phoneRequired'),
                  minLength: { value: 9, message: t('auth.validation.phoneMin') },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.phoneInput}
                    placeholder={t('auth.login.phonePlaceholder')}
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => { setFocusedField(null); onBlur(); }}
                    editable={!loading}
                  />
                )}
              />
            </View>
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone.message}</Text>
            )}

            {/* Password field */}
            <Text style={[styles.label, styles.labelSpaced]}>
              {t('auth.login.passwordLabel')}
            </Text>
            <View
              style={[
                styles.passwordRow,
                focusedField === 'password' && styles.inputFocused,
                errors.password && styles.inputError,
              ]}
            >
              <Controller
                control={control}
                name="password"
                rules={{
                  required: t('auth.validation.passwordRequired'),
                  minLength: { value: 6, message: t('auth.validation.passwordMin') },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => { setFocusedField(null); onBlur(); }}
                    editable={!loading}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            {/* General login error */}
            {loginError && (
              <Text style={[styles.errorText, styles.loginErrorText]}>{loginError}</Text>
            )}

            {/* Login button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={onLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.background} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {t('auth.login.loginBtn')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Switch to register */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{t('auth.login.noAccount')} </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/register')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.switchLink}>{t('auth.login.registerLink')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Back button
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 16,
  },
  backBtnText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },

  // Header
  shopName: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  screenTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
  },

  // Form
  formContainer: {
    marginBottom: 24,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 2,
  },
  labelSpaced: {
    marginTop: 16,
  },

  // Base input
  inputFocused: {
    borderColor: Colors.accent,
  },
  inputError: {
    borderColor: Colors.error,
  },

  // Phone row
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    marginBottom: 6,
    overflow: 'hidden',
  },
  phoneRowError: {
    borderColor: Colors.error,
  },
  prefixBox: {
    paddingHorizontal: 14,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  prefixText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    height: '100%',
  },

  // Password row
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    marginBottom: 6,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    height: '100%',
  },
  eyeBtn: {
    paddingHorizontal: 14,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  eyeIcon: {
    fontSize: 18,
  },

  // Error
  errorText: {
    color: Colors.error,
    fontSize: FontSize.xs,
    marginBottom: 12,
    marginLeft: 2,
  },
  loginErrorText: {
    marginTop: 8,
    textAlign: 'center',
    marginLeft: 0,
  },

  // Buttons
  primaryButton: {
    height: 52,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Switch link
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  switchText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  switchLink: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
