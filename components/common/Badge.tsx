import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

// Matches AppointmentStatus from mockData
export type BadgeStatus = 'confirmed' | 'pending' | 'cancelled';

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string; // pre-translated label from t()
  style?: ViewStyle;
}

interface CountBadgeProps {
  count: number;
  style?: ViewStyle;
}

const statusBackground: Record<BadgeStatus, string> = {
  confirmed: `${Colors.success}22`, // 13% alpha
  pending: `${Colors.warning}22`,
  cancelled: `${Colors.error}22`,
};

const statusBorder: Record<BadgeStatus, string> = {
  confirmed: `${Colors.success}66`, // 40% alpha
  pending: `${Colors.warning}66`,
  cancelled: `${Colors.error}66`,
};

const statusText: Record<BadgeStatus, string> = {
  confirmed: Colors.success,
  pending: Colors.warning,
  cancelled: Colors.error,
};

/** Color-coded status badge: green/yellow/red */
export function StatusBadge({ status, label, style }: StatusBadgeProps) {
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: statusBackground[status],
          borderColor: statusBorder[status],
        },
        style,
      ]}
    >
      <View
        style={[styles.dot, { backgroundColor: statusText[status] }]}
      />
      <Text style={[styles.label, { color: statusText[status] }]}>
        {label}
      </Text>
    </View>
  );
}

/** Gold count badge used on calendar day cells */
export function CountBadge({ count, style }: CountBadgeProps) {
  if (count === 0) return null;
  return (
    <View style={[styles.countBadge, style]}>
      <Text style={styles.countLabel}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
  },
  // Count badge
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  countLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.background,
  },
});
