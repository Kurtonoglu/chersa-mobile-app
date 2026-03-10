import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';

const MOCK_PIN = '123456';
const PIN_LENGTH = 6;

const NUMPAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

export default function BarberPinScreen() {
  const router = useRouter();
  const setBarberAuthenticated = useAppStore((s) => s.setBarberAuthenticated);

  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Shake animation ────────────────────────────────────────────────────────

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // ── Numpad press ──────────────────────────────────────────────────────────

  const handleKey = (key: string) => {
    if (key === 'del') {
      setError('');
      setDigits((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '') return;

    if (digits.length >= PIN_LENGTH) return;

    const next = [...digits, key];
    setDigits(next);
    setError('');

    if (next.length === PIN_LENGTH) {
      const entered = next.join('');
      if (entered === MOCK_PIN) {
        setBarberAuthenticated(true);
        router.replace('/(barber)/dashboard');
      } else {
        shake();
        setError(t('barber.pin.wrongPin'));
        // Clear after short delay
        setTimeout(() => setDigits([]), 700);
      }
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>C</Text>
        </View>
        <Text style={styles.title}>{t('barber.pin.title')}</Text>
        <Text style={styles.subtitle}>{t('barber.pin.subtitle')}</Text>
      </View>

      {/* PIN dots */}
      <Animated.View
        style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              digits.length > i && styles.dotFilled,
              error ? styles.dotError : null,
            ]}
          />
        ))}
      </Animated.View>

      {/* Error message */}
      <Text style={styles.errorText}>{error}</Text>

      {/* Numpad */}
      <View style={styles.numpad}>
        {NUMPAD_KEYS.map((row, ri) => (
          <View key={ri} style={styles.numpadRow}>
            {row.map((key, ki) => {
              if (key === '') {
                return <View key={ki} style={styles.numpadKeyPlaceholder} />;
              }
              if (key === 'del') {
                return (
                  <TouchableOpacity
                    key={ki}
                    style={styles.numpadKey}
                    onPress={() => handleKey('del')}
                    activeOpacity={0.6}
                  >
                    <Ionicons
                      name="backspace-outline"
                      size={24}
                      color={Colors.textPrimary}
                    />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={ki}
                  style={styles.numpadKey}
                  onPress={() => handleKey(key)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.numpadKeyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },

  backBtn: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 8,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 48,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,168,76,0.06)',
    marginBottom: 20,
  },
  logoLetter: {
    color: Colors.accent,
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
  },

  // ── PIN dots
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  dotError: {
    borderColor: Colors.error,
    backgroundColor: Colors.error,
  },

  errorText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    minHeight: 20,
    marginBottom: 32,
    textAlign: 'center',
  },

  // ── Numpad
  numpad: {
    gap: 12,
    width: '100%',
    paddingHorizontal: 40,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  numpadKey: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadKeyPlaceholder: {
    width: 76,
    height: 76,
  },
  numpadKeyText: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '400',
  },
});
