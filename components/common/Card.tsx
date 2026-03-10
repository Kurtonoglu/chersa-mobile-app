import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  /** Adds a gold accent left border strip */
  accent?: boolean;
  /** Replace the default border with a gold border (e.g. selected state) */
  selected?: boolean;
  style?: ViewStyle;
}

export function Card({ children, onPress, accent, selected, style }: CardProps) {
  const containerStyle = [
    styles.card,
    accent && styles.accentBorder,
    selected && styles.selectedBorder,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={containerStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  accentBorder: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  selectedBorder: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
});
