import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, LineHeight } from '../../constants/typography';
import { Button } from './Button';

interface EmptyStateProps {
  /** Main message — use a friendly, personality-driven string from t() */
  message: string;
  /** Optional emoji displayed above the message */
  emoji?: string;
  /** Label for the optional action button */
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  message,
  emoji,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {emoji ? (
        <Text style={styles.emoji}>{emoji}</Text>
      ) : null}

      <Text style={styles.message}>{message}</Text>

      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outlined"
          size="sm"
          fullWidth={false}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingVertical: 48,
    gap: 16,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  message: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: LineHeight.relaxed,
  },
  button: {
    marginTop: 4,
    paddingHorizontal: 24,
  },
});
