import { Platform } from 'react-native';

/**
 * Font System for Brutal Alarm App
 * 
 * Provides consistent, modern fonts optimized for alarm applications
 * with proper platform-specific fallbacks and accessibility considerations.
 */

// Platform-specific font families with fallback for test environment
const getPlatformFont = (iosFont, androidFont, fallbackFont) => {
  try {
    if (Platform && Platform.select) {
      return Platform.select({
        ios: iosFont,
        android: androidFont,
        default: fallbackFont,
      });
    }
  } catch (error) {
    // Fallback for test environment
  }
  return fallbackFont;
};

const FONTS = {
  // Primary Display Fonts (for large text, headings, time display)
  display: getPlatformFont('SF Pro Display', 'Roboto', 'System'),
  
  // Secondary Body Fonts (for regular text, buttons, UI elements)
  body: getPlatformFont('SF Pro Text', 'Roboto', 'System'),
  
  // Monospace Fonts (for precise time display, numbers)
  mono: getPlatformFont('SF Mono', 'Roboto Mono', 'Monaco'),
  
  // Impact Fonts (for alarm messages, urgent notifications)
  impact: getPlatformFont('Impact', 'Roboto Black', 'Arial Black'),
};

// Font weights with platform-specific fallbacks and test environment support
const getPlatformFontWeight = (iosWeight, androidWeight, fallbackWeight) => {
  try {
    if (Platform && Platform.select) {
      return Platform.select({
        ios: iosWeight,
        android: androidWeight,
        default: fallbackWeight,
      });
    }
  } catch (error) {
    // Fallback for test environment
  }
  return fallbackWeight;
};

const FONT_WEIGHTS = {
  thin: getPlatformFontWeight('100', '100', '100'),
  light: getPlatformFontWeight('300', '300', '300'),
  regular: getPlatformFontWeight('400', '400', '400'),
  medium: getPlatformFontWeight('500', '500', '500'),
  semibold: getPlatformFontWeight('600', '600', '600'),
  bold: getPlatformFontWeight('700', '700', '700'),
  heavy: getPlatformFontWeight('800', '800', '800'),
  black: getPlatformFontWeight('900', '900', '900'),
};

// Predefined text styles for consistent usage
export const TEXT_STYLES = {
  // Time Display Styles
  timeDisplay: {
    fontFamily: FONTS.display,
    fontWeight: FONT_WEIGHTS.light,
    fontSize: 36,
    letterSpacing: -0.5,
  },
  
  timeDisplayLarge: {
    fontFamily: FONTS.display,
    fontWeight: FONT_WEIGHTS.thin,
    fontSize: 48,
    letterSpacing: -1,
  },
  
  timeDisplayExtraLarge: {
    fontFamily: FONTS.display,
    fontWeight: FONT_WEIGHTS.thin,
    fontSize: 64,
    letterSpacing: -1.5,
  },
  
  // Date Display Styles
  dateDisplay: {
    fontFamily: FONTS.body,
    fontWeight: FONT_WEIGHTS.regular,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  
  // Alarm Status Styles
  alarmTitle: {
    fontFamily: FONTS.impact,
    fontWeight: FONT_WEIGHTS.black,
    fontSize: 48,
    letterSpacing: -0.5,
  },
  
  alarmMessage: {
    fontFamily: FONTS.body,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: 18,
    letterSpacing: 0.1,
    lineHeight: 24,
  },
  
  alarmTime: {
    fontFamily: FONTS.mono,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: 32,
    letterSpacing: 0.5,
  },
  
  // UI Element Styles
  sectionTitle: {
    fontFamily: FONTS.body,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: 16,
    letterSpacing: 0.1,
  },
  
  buttonText: {
    fontFamily: FONTS.body,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: 16,
    letterSpacing: 0.1,
  },
  
  buttonTextLarge: {
    fontFamily: FONTS.body,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: 18,
    letterSpacing: 0.1,
  },
  
  controlText: {
    fontFamily: FONTS.body,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: 16,
    letterSpacing: 0.1,
  },
  
  // Navigation and Header Styles
  headerTitle: {
    fontFamily: FONTS.display,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: 18,
    letterSpacing: 0.1,
  },
  
  closeButtonText: {
    fontFamily: FONTS.body,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: 16,
    letterSpacing: 0.1,
  },
  
  // Modal and Popup Styles
  modalTitle: {
    fontFamily: FONTS.display,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: 24,
    letterSpacing: 0.1,
  },
  
  modalBody: {
    fontFamily: FONTS.body,
    fontWeight: FONT_WEIGHTS.regular,
    fontSize: 16,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  
  // Splash Screen Styles
  splashTitle: {
    fontFamily: FONTS.display,
    fontWeight: FONT_WEIGHTS.black,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  
  splashSubtitle: {
    fontFamily: FONTS.body,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: 18,
    letterSpacing: 0.1,
    lineHeight: 24,
  },
  
  // Language and Settings Styles
  languageOption: {
    fontFamily: FONTS.body,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: 16,
    letterSpacing: 0.1,
  },
  
  // Accessibility and Small Text
  caption: {
    fontFamily: FONTS.body,
    fontWeight: FONT_WEIGHTS.regular,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  
  label: {
    fontFamily: FONTS.body,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: 14,
    letterSpacing: 0.1,
  },
};

// Helper function to create custom text styles
export const createTextStyle = (baseStyle, customProps = {}) => {
  return {
    ...baseStyle,
    ...customProps,
  };
};

// Export font families for direct use
export { FONTS, FONT_WEIGHTS };

export default TEXT_STYLES;
