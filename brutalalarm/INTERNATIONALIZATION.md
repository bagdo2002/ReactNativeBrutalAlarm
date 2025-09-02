# Internationalization Implementation

This document describes the internationalization (i18n) features added to the Brutal Alarm app.

## Features Added

### 1. Multi-language Support
- **English** (en) - Default language
- **Georgian** (ka) - ქართული 
- **Russian** (ru) - Русский

### 2. Language Detection
- Automatically detects device language on first launch
- Falls back to English if device language is not supported
- Saves user's language preference to AsyncStorage

### 3. Language Selector
- Globe icon (🌐) button in the app header
- Modal interface to switch between languages
- Shows language names in both native script and English

### 4. Translated Content
- All UI text and labels
- Alert messages and notifications  
- Default alarm sound names and messages
- Date formatting respects selected locale

## File Structure

```
/locales/
  ├── en.json     # English translations
  ├── ka.json     # Georgian translations  
  └── ru.json     # Russian translations

/i18n/
  └── index.js    # i18n configuration and language detector

/components/
  └── LanguageSelector.js  # Language selection modal component
```

## Usage

### Changing Language
1. Tap the globe icon (🌐) in the top-right corner
2. Select your preferred language from the modal
3. The app will immediately update to the selected language
4. Your choice is saved and will persist between app sessions

### Adding New Languages
1. Create a new JSON file in `/locales/` (e.g., `es.json` for Spanish)
2. Add all translation keys with translated values
3. Update the `resources` object in `/i18n/index.js`
4. Add the language to the `getAvailableLanguages()` function

## Technical Details

### Dependencies Added
- `react-native-localize` - Device locale detection
- `i18next` - Internationalization framework
- `react-i18next` - React integration for i18next

### Key Features
- Dynamic language switching without app restart
- Persistent language preferences using AsyncStorage
- Automatic device locale detection
- Fallback to English for unsupported languages
- Date formatting respects selected locale

### Translation Keys
All text in the app uses translation keys like `t('appTitle')`, `t('wakeUp')`, etc. The translation files contain the actual text for each supported language.

## Georgian Translations
The Georgian translations include culturally appropriate adaptations:
- "ბრუტალური მაღვიძარა" (Brutal Alarm)
- "ადექი, ზარმაცო!" (Get up, lazy one!)
- Proper Georgian date formatting

## Russian Translations  
The Russian translations maintain the brutal wake-up theme:
- "Брутальный Будильник" (Brutal Alarm)
- "ПРОСЫПАЙСЯ!" (WAKE UP!)
- Appropriate Russian date formatting

The app now fully supports multiple languages and provides a seamless experience for users regardless of their preferred language.
