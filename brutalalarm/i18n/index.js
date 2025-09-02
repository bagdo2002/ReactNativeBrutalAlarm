import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from '../locales/en.json';
import ka from '../locales/ka.json';
import ru from '../locales/ru.json';

const LANGUAGE_STORAGE_KEY = '@brutal_alarm_language';

// Language detector
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      // First check if user has saved a language preference
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }

      // If no saved preference, use device region
      const region = Localization.region; // e.g. "GE", "US", "DE"
      console.log('Detected country/region:', region);
      
      // Set language based on device region
      // Georgian if device region is Georgia, English for all other regions
      const detectedLanguage = region === 'GE' ? 'ka' : 'en';
      
      console.log('Setting default language based on region:', detectedLanguage);
      callback(detectedLanguage);
    } catch (error) {
      console.error('Language detection error:', error);
      callback('en'); // fallback to English
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      ka: { translation: ka },
      ru: { translation: ru }
    },
    fallbackLng: 'en',
    debug: typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    returnObjects: true, // Enable returnObjects to fix warnings
    react: {
      useSuspense: true, // Explicitly enable Suspense
    },
    // Add these options for better React 19 compatibility
    initImmediate: false,
    load: 'languageOnly',
  });

export default i18n;

// Helper function to change language
export const changeLanguage = async (languageCode) => {
  try {
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Helper function to get available languages
export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' }
];
