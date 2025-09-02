# Brutal Alarm App - Setup Instructions

## Quick Start

1. **Install Dependencies** (Already done)
   ```bash
   npm install
   ```

2. **Add Your Voice Recordings**
   - Record 3 audio files (MP3 or WAV format)
   - Name them: `alarm1.mp3`, `alarm2.mp3`, `alarm3.mp3`
   - Place them in the `assets/audio/` folder
   - The app will randomly select one when the alarm triggers

3. **Run the App**
   ```bash
   # For iOS
   npm run ios
   
   # For Android  
   npm run android
   
   # For Web (testing)
   npm run web
   ```

## Voice Recording Suggestions

Record these phrases (or create your own):
1. "Get up, you lazy, unemployed pathetic fuck, and go to work!"
2. "Wake up, time to stop wasting life!"
3. "Move your ass, hustle or rot!"

## Features

- ✅ Current time display
- ✅ Set alarm with time picker
- ✅ Visual alarm notification with custom text
- ✅ Stop alarm button
- ✅ Auto-stop after 1 minute
- ✅ Clean, minimal dark UI
- 🔄 Audio playback (requires audio files)

## Audio Setup

The app currently works without audio files (shows text only). To enable sound:

1. Record or find 3 MP3/WAV files
2. Name them exactly: `alarm1.mp3`, `alarm2.mp3`, `alarm3.mp3`
3. Place in `assets/audio/` folder
4. Update the App.js file to use the audio files (uncomment audio code)

## Development

- Built with Expo for easy development and testing
- Uses `@react-native-community/datetimepicker` for time selection
- Uses `expo-av` for audio playback
- Minimal dependencies for fast startup

## Testing

Set an alarm for 1-2 minutes from now to test the functionality. The app checks every second for alarm matches.
