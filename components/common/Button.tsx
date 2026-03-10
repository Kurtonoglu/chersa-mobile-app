import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

type ButtonVariant = 'primary' | 'outlined' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const containerVariant: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: Colors.accent },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
};

const containerSize: Record<ButtonSize, ViewStyle> = {
  sm: { minHeight: 44, paddingHorizontal: 14, borderRadius: 6 },
  md: { minHeight: 48, paddingHorizontal: 20, borderRadius: 8 },
  lg: { minHeight: 56, paddingHorizontal: 24, borderRadius: 10 },
};

const labelVariant: Record<ButtonVariant, TextStyle> = {
  primary: { color: Colors.background },
  outlined: { color: Colors.accent },
  ghost: { color: Colors.accent },
  danger: { color: Colors.error },
};

const labelSize: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: FontSize.sm },
  md: { fontSize: FontSize.base },
  lg: { fontSize: FontSize.md, letterSpacing: 1 },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const spinnerColor =
    variant === 'primary' ? Colors.background : Colors.accent;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        containerVariant[variant],
        containerSize[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text
          style={[
            styles.label,
            labelVariant[variant],
            labelSize[size],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    letterSpacing: 0.5,
  },
});
