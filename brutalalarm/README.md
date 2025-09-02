# Brutal Alarm

A React Native alarm clock app designed to wake you up with intensity and motivation. Features Navy SEAL-style wake-up calls, custom voice recordings, and multilingual support.

## Features

### Core Functionality
- ⏰ **Precise Alarm System** - Set alarms with exact time control
- 🎵 **Multiple Sound Options** - Choose from built-in sounds or upload custom audio
- 🎙️ **Custom Voice Recordings** - Record personalized wake-up messages
- 🗣️ **AI-Generated Voice** - ElevenLabs integration for dynamic voice generation
- 🌐 **Multilingual Support** - English, Georgian (ქართული), and Russian (Русский)

### Motivational Elements
- 💪 **Navy SEAL Section** - Hardcore motivational wake-up experience
- 🔥 **Brutal Mode** - Intense alarm experience designed to get you moving
- 📱 **Beautiful UI** - Modern, responsive interface with smooth animations

### Technical Features
- 📱 **Cross-Platform** - Built with React Native for iOS and Android
- 🧪 **Comprehensive Testing** - Full test suite with Jest
- 🎨 **Custom Components** - Modular, reusable UI components
- 🔧 **Development Tools** - Complete development and build setup

## Installation

### Prerequisites
- Node.js (v14 or higher)
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

### Setup
```bash
# Clone the repository
git clone https://github.com/bagdo2002/brutalalarm.git
cd brutalalarm

# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Development

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building for Production
```bash
# Build for iOS
npm run build:ios

# Build for Android
npm run build:android
```

## Project Structure

```
brutalalarm/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── locales/            # Internationalization files
├── assets/             # Images, audio files, and other assets
├── __tests__/          # Test files
├── i18n/               # Internationalization configuration
└── utils/              # Utility functions
```

## Key Components

- **AlarmStatus** - Displays current alarm status and controls
- **TimeDisplay** - Shows current time with customizable format
- **TimePickerModal** - Interface for setting alarm time
- **SoundSelector** - Choose alarm sounds and custom audio
- **RecordingModal** - Record custom wake-up messages
- **LanguageSelector** - Switch between supported languages
- **NavySealSection** - Motivational hardcore wake-up experience

## Internationalization

The app supports multiple languages:
- **English** (en)
- **Georgian** (ka) - ქართული
- **Russian** (ru) - Русский

Language files are located in the `locales/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

This project includes comprehensive testing:
- Unit tests for components and hooks
- Integration tests for alarm flow
- Utility function tests
- Mocking for React Native components

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- ElevenLabs for AI voice generation
- React Native community for excellent tooling
- Contributors and testers

---

**Wake up like a warrior. No excuses. No snooze button. Just pure, brutal motivation to start your day.**
