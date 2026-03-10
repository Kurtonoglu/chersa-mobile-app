// Fonts must be loaded in the root layout using @expo-google-fonts/inter
// npm install @expo-google-fonts/inter expo-font --legacy-peer-deps

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
} as const;

export const LineHeight = {
  tight: 16,
  normal: 22,
  relaxed: 28,
} as const;

export const Typography = {
  fontFamily: FontFamily,
  fontSize: FontSize,
  lineHeight: LineHeight,
} as const;
