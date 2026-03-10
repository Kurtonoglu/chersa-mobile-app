import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog.
 * React Native's Alert.alert() does not work on web (no native dialog, callbacks not fired).
 * On web we use window.confirm(); on iOS/Android we use Alert.alert().
 */
export function confirm(
  title: string,
  message: string,
  options: {
    cancelText: string;
    confirmText: string;
    onConfirm: () => void;
    destructive?: boolean;
  },
): void {
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' && window.confirm([title, message].filter(Boolean).join('\n\n'));
    if (ok) {
      options.onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: options.cancelText, style: 'cancel' },
    {
      text: options.confirmText,
      style: options.destructive ? 'destructive' : 'default',
      onPress: options.onConfirm,
    },
  ]);
}
