import { jest } from '@jest/globals';

// Setup React Native Testing Library
import '@testing-library/react-native/extend-expect';

// Set up global variables
global.__DEV__ = process.env.NODE_ENV === 'development';

// Mock Expo modules
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-av', () => {
  const mockRecording = {
    startAsync: jest.fn(() => Promise.resolve()),
    stopAndUnloadAsync: jest.fn(() => Promise.resolve({
      uri: 'file://test-recording.m4a'
    })),
    getStatusAsync: jest.fn(() => Promise.resolve({ 
      isRecording: false,
      isDoneRecording: true,
    })),
    getURI: jest.fn(() => 'file://test-recording.m4a'),
  };

  const mockSound = {
    playAsync: jest.fn(() => Promise.resolve()),
    stopAsync: jest.fn(() => Promise.resolve()),
    unloadAsync: jest.fn(() => Promise.resolve()),
    getStatusAsync: jest.fn(() => Promise.resolve({ 
      isPlaying: false, 
      isLoaded: true 
    })),
  };

  return {
    Audio: {
      setAudioModeAsync: jest.fn(() => Promise.resolve()),
      requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
      Recording: {
        createAsync: jest.fn(() => Promise.resolve({
          recording: mockRecording
        })),
      },
      Sound: {
        createAsync: jest.fn(() => Promise.resolve({
          sound: mockSound
        })),
      },
      // Add missing Audio constants
      AndroidOutputFormat: {
        MPEG_4: 'MPEG_4',
      },
      AndroidAudioEncoder: {
        AAC: 'AAC',
      },
      IOSOutputFormat: {
        MPEG4AAC: 'MPEG4AAC',
      },
      IOSAudioQuality: {
        MEDIUM: 'MEDIUM',
        HIGH: 'HIGH',
      },
    },
  };
});

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  removeNotificationSubscription: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidNotificationPriority: { MAX: 'max', DEFAULT: 'default' },
  AndroidImportance: { MAX: 'max' },
  AndroidNotificationVisibility: { PUBLIC: 'public' },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://documents/',
  cacheDirectory: 'file://cache/',
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, size: 1024 })),
  deleteAsync: jest.fn(),
  moveAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

jest.mock('expo-localization', () => ({
  region: 'US',
  locale: 'en-US',
  locales: ['en-US'],
  timezone: 'America/New_York',
  isRTL: false,
  getLocalizationAsync: jest.fn(() => Promise.resolve({
    locale: 'en-US',
    locales: ['en-US'],
    region: 'US',
    isRTL: false,
  })),
}));

jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({
    data: new ArrayBuffer(8),
    status: 200,
  })),
}));

// Mock the i18n module for tests
jest.mock('./i18n', () => ({
  default: {
    options: {
      resources: {
        en: { translation: {} },
        ka: { translation: {} },
        ru: { translation: {} }
      },
      fallbackLng: 'en',
      debug: false,
      interpolation: { escapeValue: false },
      returnObjects: true,
      detection: {
        detect: jest.fn(),
        cacheUserLanguage: jest.fn()
      }
    }
  }
}));

// Mock i18next and react-i18next
jest.mock('i18next', () => ({
  use: jest.fn(() => ({
    use: jest.fn(() => ({
      init: jest.fn(),
    })),
  })),
  t: jest.fn((key) => key),
  changeLanguage: jest.fn(),
  language: 'en',
}));

jest.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
  useTranslation: () => ({
    t: jest.fn((key, options) => {
      if (options && options.name) {
        return `${key} ${options.name}`;
      }
      return key;
    }),
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless needed
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Add cleanup for tests to prevent memory leaks
afterEach(() => {
  // Clean up any pending timers
  jest.clearAllTimers();
  
  // Reset all mocks between tests
  jest.clearAllMocks();
});