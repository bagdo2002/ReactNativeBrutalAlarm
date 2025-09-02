import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n, { changeLanguage, getAvailableLanguages } from '../../i18n';

// Mock the translation files
jest.mock('../../locales/en.json', () => ({
  appTitle: 'Brutal Alarm',
  wakeUp: 'Wake Up!',
  alarmSet: 'Alarm Set',
}), { virtual: true });

jest.mock('../../locales/ka.json', () => ({
  appTitle: 'ბრუტალური ღვიძილი',
  wakeUp: 'ადექი!',
  alarmSet: 'ღვიძილი დაყენებულია',
}), { virtual: true });

jest.mock('../../locales/ru.json', () => ({
  appTitle: 'Брутальный Будильник',
  wakeUp: 'Просыпайся!',
  alarmSet: 'Будильник установлен',
}), { virtual: true });

describe('i18n Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Language Detection', () => {
    it('should use saved language preference when available', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('ru');
      
      const languageDetector = i18n.options.detection;
      const callback = jest.fn();
      
      await languageDetector.detect(callback);
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@brutal_alarm_language');
      expect(callback).toHaveBeenCalledWith('ru');
    });

    it('should detect Georgian for Georgia region when no saved preference', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      Localization.region = 'GE';
      
      const languageDetector = i18n.options.detection;
      const callback = jest.fn();
      
      await languageDetector.detect(callback);
      
      expect(callback).toHaveBeenCalledWith('ka');
    });

    it('should default to English for non-Georgian regions', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      Localization.region = 'US';
      
      const languageDetector = i18n.options.detection;
      const callback = jest.fn();
      
      await languageDetector.detect(callback);
      
      expect(callback).toHaveBeenCalledWith('en');
    });

    it('should fallback to English on detection error', async () => {
      AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const languageDetector = i18n.options.detection;
      const callback = jest.fn();
      
      await languageDetector.detect(callback);
      
      expect(callback).toHaveBeenCalledWith('en');
    });

    it('should cache user language preference', async () => {
      const languageDetector = i18n.options.detection;
      
      await languageDetector.cacheUserLanguage('ka');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@brutal_alarm_language', 'ka');
    });

    it('should handle cache error gracefully', async () => {
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const languageDetector = i18n.options.detection;
      
      // Should not throw
      await expect(languageDetector.cacheUserLanguage('en')).resolves.toBeUndefined();
    });
  });

  describe('i18n Configuration', () => {
    it('should be initialized with correct resources', () => {
      expect(i18n.options.resources).toHaveProperty('en');
      expect(i18n.options.resources).toHaveProperty('ka');
      expect(i18n.options.resources).toHaveProperty('ru');
    });

    it('should have English as fallback language', () => {
      expect(i18n.options.fallbackLng).toBe('en');
    });

    it('should have debug enabled in development', () => {
      expect(i18n.options.debug).toBe(__DEV__);
    });

    it('should have interpolation configured correctly', () => {
      expect(i18n.options.interpolation.escapeValue).toBe(false);
    });

    it('should have returnObjects enabled', () => {
      expect(i18n.options.returnObjects).toBe(true);
    });
  });

  describe('changeLanguage function', () => {
    beforeEach(() => {
      // Mock i18n.changeLanguage method
      i18n.changeLanguage = jest.fn().mockResolvedValue();
    });

    it('should change language and save to storage', async () => {
      await changeLanguage('ka');
      
      expect(i18n.changeLanguage).toHaveBeenCalledWith('ka');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@brutal_alarm_language', 'ka');
    });

    it('should handle i18n change language error', async () => {
      i18n.changeLanguage.mockRejectedValueOnce(new Error('i18n error'));
      
      // Should not throw
      await expect(changeLanguage('ru')).resolves.toBeUndefined();
    });

    it('should handle storage error', async () => {
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      // Should not throw
      await expect(changeLanguage('en')).resolves.toBeUndefined();
    });
  });

  describe('getAvailableLanguages function', () => {
    it('should return all available languages', () => {
      const languages = getAvailableLanguages();
      
      expect(languages).toHaveLength(3);
      expect(languages).toContainEqual({
        code: 'en',
        name: 'English',
        nativeName: 'English'
      });
      expect(languages).toContainEqual({
        code: 'ka',
        name: 'Georgian',
        nativeName: 'ქართული'
      });
      expect(languages).toContainEqual({
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский'
      });
    });

    it('should return languages in consistent order', () => {
      const languages1 = getAvailableLanguages();
      const languages2 = getAvailableLanguages();
      
      expect(languages1).toEqual(languages2);
    });
  });

  describe('Translation Keys', () => {
    it('should load English translations correctly', () => {
      const resources = i18n.options.resources.en.translation;
      
      expect(resources.appTitle).toBe('Brutal Alarm');
      expect(resources.wakeUp).toBe('Wake Up!');
      expect(resources.alarmSet).toBe('Alarm Set');
    });

    it('should load Georgian translations correctly', () => {
      const resources = i18n.options.resources.ka.translation;
      
      expect(resources.appTitle).toBe('ბრუტალური ღვიძილი');
      expect(resources.wakeUp).toBe('ადექი!');
      expect(resources.alarmSet).toBe('ღვიძილი დაყენებულია');
    });

    it('should load Russian translations correctly', () => {
      const resources = i18n.options.resources.ru.translation;
      
      expect(resources.appTitle).toBe('Брутальный Будильник');
      expect(resources.wakeUp).toBe('Просыпайся!');
      expect(resources.alarmSet).toBe('Будильник установлен');
    });
  });

  describe('Language Storage Key', () => {
    it('should use consistent storage key', async () => {
      await changeLanguage('en');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@brutal_alarm_language', 'en');
    });
  });
});
