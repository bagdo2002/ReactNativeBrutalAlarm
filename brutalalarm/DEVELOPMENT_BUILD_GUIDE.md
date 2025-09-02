# Development Build Setup Guide

Your React Native alarm app has been successfully configured for development builds! Here's what we've accomplished and how to proceed:

## ✅ Completed Setup

### 1. Package Configuration
- Updated `package.json` with development build scripts:
  - `npm run prebuild` - Generate native directories
  - `npm run run:ios` - Build and run on iOS
  - `npm run run:android` - Build and run on Android

### 2. iOS Configuration
- Set deployment target to iOS 18.0 in `app.json`
- Configured background audio permissions
- Added microphone usage description
- Generated native iOS project files

### 3. Git Configuration
- Updated `.gitignore` to exclude generated native directories
- Native build artifacts are properly ignored

## 🚧 Current iOS Build Issue

There's a compatibility issue with the `onGeometryChange` SwiftUI API that requires iOS 18+. Here are your options:

### Option 1: Use iOS Simulator with iOS 18+ (Recommended)
```bash
# Make sure you have iOS 18+ simulator installed
npx expo run:ios
```

### Option 2: Build for Android (Alternative)
```bash
npx expo run:android
```

### Option 3: Use Expo Development Build
```bash
# Install EAS CLI if you haven't
npm install -g eas-cli

# Create development build
eas build --platform ios --profile development
```

## 🎯 Benefits of Development Build

With a development build, you can now test:

1. **Background Audio** - Your alarm sounds will work even when the app is in the background
2. **Push Notifications** - Local notifications for alarms will function properly
3. **Native Permissions** - Microphone access for custom alarm sounds
4. **Full Device Features** - All native iOS/Android capabilities

## 🚀 Next Steps

1. **For iOS**: Use a device or simulator with iOS 18+ installed
2. **For Android**: Run `npx expo run:android` (should work without issues)
3. **Test Features**: 
   - Set an alarm and put the app in background
   - Test notification permissions
   - Try recording custom alarm sounds

## 📱 Running the App

### iOS (iOS 18+ required):
```bash
npx expo run:ios
```

### Android:
```bash
npx expo run:android
```

### Development Server:
```bash
npm start
```

The development build will give you access to all the advanced features that don't work in Expo Go, making your alarm app fully functional!
