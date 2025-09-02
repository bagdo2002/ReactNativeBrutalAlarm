import { Platform } from 'react-native';

/**
 * Custom Fonts Configuration for Brutal Alarm App
 * 
 * Provides additional font options and ensures consistent font loading
 * across different platforms with proper fallbacks.
 */

// Extended font families with custom options
export const CUSTOM_FONTS = {
  // Modern Display Fonts
  modern: {
    ios: 'SF Pro Display',
    android: 'Roboto',
    web: 'Inter',
    fallback: 'System',
  },
  
  // Monospace Fonts for Time Display
  mono: {
    ios: 'SF Mono',
    android: 'Roboto Mono',
    web: 'JetBrains Mono',
    fallback: 'Monaco',
  },
  
  // Impact Fonts for Alarm Messages
  impact: {
    ios: 'Impact',
    android: 'Roboto Black',
    web: 'Bebas Neue',
    fallback: 'Arial Black',
  },
  
  // Serif Fonts for Elegant Text
  serif: {
    ios: 'Georgia',
    android: 'Noto Serif',
    web: 'Merriweather',
    fallback: 'Times New Roman',
  },
  
  // Rounded Fonts for Friendly UI
  rounded: {
    ios: 'SF Rounded',
    android: 'Product Sans',
    web: 'Nunito',
    fallback: 'Arial',
  },
};

// Font weight mappings for different platforms
export const FONT_WEIGHT_MAP = {
  thin: {
    ios: '100',
    android: '100',
    web: '100',
    fallback: '100',
  },
  light: {
    ios: '300',
    android: '300',
    web: '300',
    fallback: '300',
  },
  regular: {
    ios: '400',
    android: '400',
    web: '400',
    fallback: '400',
  },
  medium: {
    ios: '500',
    android: '500',
    web: '500',
    fallback: '500',
  },
  semibold: {
    ios: '600',
    android: '600',
    web: '600',
    fallback: '600',
  },
  bold: {
    ios: '700',
    android: '700',
    web: '700',
    fallback: '700',
  },
  heavy: {
    ios: '800',
    android: '800',
    web: '800',
    fallback: '800',
  },
  black: {
    ios: '900',
    android: '900',
    web: '900',
    fallback: '900',
  },
};

// Helper function to get platform-specific font
export const getFont = (fontFamily, platform = Platform.OS) => {
  const font = CUSTOM_FONTS[fontFamily];
  if (!font) return CUSTOM_FONTS.modern.fallback;
  
  // Handle test environment where Platform.OS might not be available
  const currentPlatform = platform || (Platform.OS || 'default');
  
  switch (currentPlatform) {
    case 'ios':
      return font.ios || font.fallback;
    case 'android':
      return font.android || font.fallback;
    case 'web':
      return font.web || font.fallback;
    default:
      return font.fallback;
  }
};

// Helper function to get platform-specific font weight
export const getFontWeight = (weight, platform = Platform.OS) => {
  const fontWeight = FONT_WEIGHT_MAP[weight];
  if (!fontWeight) return FONT_WEIGHT_MAP.regular.fallback;
  
  // Handle test environment where Platform.OS might not be available
  const currentPlatform = platform || (Platform.OS || 'default');
  
  switch (currentPlatform) {
    case 'ios':
      return fontWeight.ios || fontWeight.fallback;
    case 'android':
      return fontWeight.android || fontWeight.fallback;
    case 'web':
      return fontWeight.web || fontWeight.fallback;
    default:
      return fontWeight.fallback;
  }
};

// Predefined text styles with custom fonts
export const CUSTOM_TEXT_STYLES = {
  // Alarm-specific styles
  alarmUrgent: {
    fontFamily: getFont('impact'),
    fontWeight: getFontWeight('black'),
    fontSize: 48,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  
  alarmTimeLarge: {
    fontFamily: getFont('mono'),
    fontWeight: getFontWeight('bold'),
    fontSize: 64,
    letterSpacing: 1,
  },
  
  // Modern UI styles
  modernTitle: {
    fontFamily: getFont('modern'),
    fontWeight: getFontWeight('black'),
    fontSize: 32,
    letterSpacing: -0.5,
  },
  
  modernBody: {
    fontFamily: getFont('modern'),
    fontWeight: getFontWeight('regular'),
    fontSize: 16,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  
  // Elegant styles
  elegantTitle: {
    fontFamily: getFont('serif'),
    fontWeight: getFontWeight('bold'),
    fontSize: 28,
    letterSpacing: 0.2,
  },
  
  elegantBody: {
    fontFamily: getFont('serif'),
    fontWeight: getFontWeight('regular'),
    fontSize: 16,
    letterSpacing: 0.1,
    lineHeight: 24,
  },
  
  // Friendly styles
  friendlyTitle: {
    fontFamily: getFont('rounded'),
    fontWeight: getFontWeight('bold'),
    fontSize: 24,
    letterSpacing: 0.1,
  },
  
  friendlyBody: {
    fontFamily: getFont('rounded'),
    fontWeight: getFontWeight('medium'),
    fontSize: 16,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
};

// Export default font configuration
export default {
  fonts: CUSTOM_FONTS,
  weights: FONT_WEIGHT_MAP,
  styles: CUSTOM_TEXT_STYLES,
  getFont,
  getFontWeight,
};
