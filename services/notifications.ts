/**
 * services/notifications.ts — Push notification registration service.
 *
 * CURRENT STATE: stub — permission request works, token logging only.
 * BACKEND TODO: save the push token to the user's profile in Supabase so the
 * server can send notifications.
 */

// import { supabase } from '../lib/supabase';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { ServiceResult } from './auth';

// ─── Configure notification handler (call once at app startup) ────────────────

/**
 * Set the foreground notification behavior.
 * Call this in the root _layout.tsx:
 *   import { configureNotifications } from '../services/notifications';
 *   configureNotifications();
 */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// ─── Token registration ───────────────────────────────────────────────────────

/**
 * Request permission and retrieve the Expo push token.
 *
 * BACKEND TODO after getting the token:
 *   await supabase
 *     .from('profiles')
 *     .update({ push_token: token })
 *     .eq('id', currentUserId);
 */
export async function registerForPushNotifications(): Promise<ServiceResult<string>> {
  if (!Device.isDevice) {
    return { data: null, error: 'Push notifications require a physical device.' };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { data: null, error: 'Notification permission denied.' };
  }

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    // TODO: persist token to Supabase profile
    return { data: token, error: null };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}
