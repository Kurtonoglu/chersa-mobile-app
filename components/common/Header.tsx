import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

// ─── Logo Placeholder ─────────────────────────────────────────────────────────
// Circular gold border with "C" in center — used on every screen per spec.

interface LogoPlaceholderProps {
  size?: number;
}

export function LogoPlaceholder({ size = 80 }: LogoPlaceholderProps) {
  const radius = size / 2;
  const fontSize = size * 0.38;

  return (
    <View
      style={[
        styles.logoCircle,
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
      ]}
    >
      <Text style={[styles.logoLetter, { fontSize }]}>C</Text>
    </View>
  );
}

// ─── Atmospheric Screen Header ────────────────────────────────────────────────
// Dark gradient-style header block used at the top of client screens.

interface HeaderProps {
  /** Show the logo placeholder (default true) */
  showLogo?: boolean;
  /** Gold shop name below the logo */
  shopName?: string;
  /** White screen title rendered below shopName / logo */
  title?: string;
  /** Custom height; defaults to 220 */
  height?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function Header({
  showLogo = true,
  shopName,
  title,
  height = 220,
  style,
  children,
}: HeaderProps) {
  return (
    <View style={[styles.container, { height }, style]}>
      {/* Dark gradient layers — bottom layer is slightly lighter for depth */}
      <View style={[StyleSheet.absoluteFill, styles.gradientBottom]} />
      <View style={[StyleSheet.absoluteFill, styles.gradientTop]} />

      {/* Content */}
      <View style={styles.content}>
        {showLogo && <LogoPlaceholder size={72} />}

        {shopName ? (
          <Text style={styles.shopName}>{shopName}</Text>
        ) : null}

        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : null}

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Logo
  logoCircle: {
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  logoLetter: {
    fontFamily: FontFamily.bold,
    color: Colors.accent,
  },

  // Header container
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  // Simulated dark gradient: two overlapping dark Views
  gradientBottom: {
    backgroundColor: '#1A1208', // very dark warm tone at bottom
  },
  gradientTop: {
    backgroundColor: Colors.background,
    // Fade from top — rendered on top, fades toward bottom via opacity trick
    opacity: 0.85,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  shopName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.accent,
    letterSpacing: 1,
    marginTop: 4,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
});
