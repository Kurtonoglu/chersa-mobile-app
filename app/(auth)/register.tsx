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
import { registerWithPhone, verifySmsOtp } from '../../services/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegisterForm {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface OtpForm {
  otp: string;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegisterForm | null>(null);

  // Main registration form
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: { name: '', phone: '', password: '', confirmPassword: '' },
  });

  // OTP form
  const otpForm = useForm<OtpForm>({ defaultValues: { otp: '' } });

  // ── Step 1: validate all fields → send SMS OTP via Supabase ────────────────
  const onSendCode = handleSubmit(async (data) => {
    setFormError(null);
    setLoading(true);
    const phone = `+387${data.phone.replace(/\s/g, '')}`;
    const { error } = await registerWithPhone(data.name, phone, data.password);
    setLoading(false);
    if (error) {
      setFormError(error);
      return;
    }
    setRegistrationData(data);
    setStep('otp');
  });

  // ── Step 2: verify OTP and create account ──────────────────────────────────
  const onVerify = otpForm.handleSubmit(async ({ otp }) => {
    if (!registrationData) return;
    const phone = `+387${registrationData.phone.replace(/\s/g, '')}`;
    setLoading(true);
    const { error } = await verifySmsOtp(phone, otp);
    setLoading(false);
    if (error) {
      otpForm.setError('otp', { message: error });
      return;
    }
    setUser({
      name: registrationData.name,
      phone,
      isLoggedIn: true,
    });
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
          <Text style={styles.screenTitle}>{t('auth.register.title')}</Text>

          {/* ── Form step ───────────────────────────────────────────────── */}
          {step === 'form' && (
            <View style={styles.formContainer}>
              {/* Name field */}
              <Text style={styles.label}>{t('auth.register.nameLabel')}</Text>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: t('auth.validation.nameRequired'),
                  minLength: { value: 3, message: t('auth.validation.nameMin') },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'name' && styles.inputFocused,
                      errors.name && styles.inputError,
                    ]}
                    placeholder={t('auth.register.namePlaceholder')}
                    placeholderTextColor={Colors.textSecondary}
                    autoCapitalize="words"
                    returnKeyType="next"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => { setFocusedField(null); onBlur(); }}
                    editable={!loading}
                  />
                )}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}

              {/* Phone field */}
              <Text style={[styles.label, styles.labelSpaced]}>
                {t('auth.register.phoneLabel')}
              </Text>
              <View
                style={[
                  styles.phoneRow,
                  focusedField === 'phone' && styles.inputFocused,
                  errors.phone && styles.phoneRowError,
                ]}
              >
                <View style={styles.prefixBox}>
                  <Text style={styles.prefixText}>{t('auth.register.phonePrefix')}</Text>
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
                      placeholder={t('auth.register.phonePlaceholder')}
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
                {t('auth.register.passwordLabel')}
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
                      placeholder={t('auth.register.passwordPlaceholder')}
                      placeholderTextColor={Colors.textSecondary}
                      secureTextEntry={!showPassword}
                      returnKeyType="next"
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

              {/* Confirm password field */}
              <Text style={[styles.label, styles.labelSpaced]}>
                {t('auth.register.confirmPasswordLabel')}
              </Text>
              <View
                style={[
                  styles.passwordRow,
                  focusedField === 'confirmPassword' && styles.inputFocused,
                  errors.confirmPassword && styles.inputError,
                ]}
              >
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: t('auth.validation.passwordRequired'),
                    validate: (val) =>
                      val === getValues('password') || t('auth.validation.passwordsMismatch'),
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.passwordInput}
                      placeholder={t('auth.register.confirmPasswordPlaceholder')}
                      placeholderTextColor={Colors.textSecondary}
                      secureTextEntry={!showConfirmPassword}
                      returnKeyType="done"
                      value={value}
                      onChangeText={onChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => { setFocusedField(null); onBlur(); }}
                      editable={!loading}
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirmPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
              )}

              {/* General form error */}
              {formError && (
                <Text style={[styles.errorText, styles.formErrorText]}>{formError}</Text>
              )}

              {/* Register button */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={onSendCode}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.background} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {t('auth.register.registerBtn')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ── OTP step ────────────────────────────────────────────────── */}
          {step === 'otp' && (
            <View style={styles.formContainer}>
              {/* Code sent notice */}
              <View style={styles.codeSentBanner}>
                <Text style={styles.codeSentText}>{t('auth.register.codeSent')}</Text>
              </View>

              {/* OTP field */}
              <Text style={styles.label}>{t('auth.register.otpLabel')}</Text>
              <Controller
                control={otpForm.control}
                name="otp"
                rules={{ required: t('auth.validation.otpRequired') }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      styles.otpInput,
                      focusedField === 'otp' && styles.inputFocused,
                      otpForm.formState.errors.otp && styles.inputError,
                    ]}
                    placeholder={t('auth.register.otpHint')}
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={6}
                    returnKeyType="done"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => { setFocusedField(null); onBlur(); }}
                    editable={!loading}
                    autoFocus
                  />
                )}
              />
              {otpForm.formState.errors.otp && (
                <Text style={styles.errorText}>
                  {otpForm.formState.errors.otp.message}
                </Text>
              )}

              {/* Verify button */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={onVerify}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.background} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {t('auth.register.verify')}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Back to form */}
              <TouchableOpacity
                style={styles.backToFormBtn}
                onPress={() => { setStep('form'); otpForm.reset(); }}
                activeOpacity={0.7}
              >
                <Text style={styles.backToFormText}>← {t('common.back')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Switch to login */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {t('auth.register.alreadyHaveAccount')}{' '}
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.switchLink}>{t('auth.register.loginLink')}</Text>
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
    marginBottom: 32,
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
  input: {
    height: 52,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    marginBottom: 6,
  },
  inputFocused: {
    borderColor: Colors.accent,
  },
  inputError: {
    borderColor: Colors.error,
  },

  // OTP input
  otpInput: {
    textAlign: 'center',
    fontSize: FontSize.xl,
    letterSpacing: 8,
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
  formErrorText: {
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

  // Code sent banner
  codeSentBanner: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  codeSentText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },

  // Back buttons
  backToFormBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  backToFormText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
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
