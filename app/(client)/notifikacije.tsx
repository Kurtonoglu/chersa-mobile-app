import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';
import { AppNotification } from '../../lib/mockData';

// ── Time-ago helper (Bosnian) ─────────────────────────────────────────────────

const timeAgo = (isoStr: string): string => {
  const diffMs = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Upravo';
  if (mins < 60) return `Prije ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Prije ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Jučer';
  return `Prije ${days} dana`;
};

// ── Notification config by type ───────────────────────────────────────────────

const TYPE_CONFIG: Record<
  AppNotification['type'],
  { icon: string; iconColor: string; iconBg: string }
> = {
  booking_confirmation: {
    icon: 'checkmark-circle',
    iconColor: Colors.success,
    iconBg: 'rgba(76,175,80,0.12)',
  },
  reminder: {
    icon: 'alarm',
    iconColor: Colors.warning,
    iconBg: 'rgba(255,193,7,0.12)',
  },
  announcement: {
    icon: 'megaphone',
    iconColor: Colors.accent,
    iconBg: 'rgba(201,168,76,0.12)',
  },
};

// ── Notification card ─────────────────────────────────────────────────────────

interface NotifCardProps {
  notification: AppNotification;
  onPress: () => void;
}

function NotifCard({ notification, onPress }: NotifCardProps) {
  const { icon, iconColor, iconBg } = TYPE_CONFIG[notification.type];

  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Unread dot indicator */}
      {!notification.read && <View style={cardStyles.unreadDot} />}

      {/* Icon */}
      <View style={[cardStyles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as never} size={22} color={iconColor} />
      </View>

      {/* Content */}
      <View style={cardStyles.content}>
        <View style={cardStyles.titleRow}>
          <Text style={cardStyles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={cardStyles.timeAgo}>{timeAgo(notification.createdAt)}</Text>
        </View>
        <Text style={cardStyles.message} numberOfLines={3}>
          {notification.message}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    paddingRight: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
    gap: 8,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '700',
    flex: 1,
  },
  timeAgo: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    flexShrink: 0,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 19,
  },
});

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={emptyStyles.container}>
      <Ionicons name="notifications-outline" size={52} color={Colors.border} />
      <Text style={emptyStyles.text}>{t('client.notifikacije.emptyUnread')}</Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
    paddingVertical: 60,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
});

// ── Screen ───────────────────────────────────────────────────────────────────

export default function NotifikacijeScreen() {
  useAppStore((s) => s.language);
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);

  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  const handlePress = (n: AppNotification) => {
    if (!n.read) markNotificationRead(n.id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Screen header ─────────────────────────────────────── */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>{t('client.notifikacije.title')}</Text>
      </View>

      {/* ── Content ───────────────────────────────────────────── */}
      {sorted.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sorted.map((n) => (
            <NotifCard
              key={n.id}
              notification={n}
              onPress={() => handlePress(n)}
            />
          ))}
        </ScrollView>
      )}
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

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
