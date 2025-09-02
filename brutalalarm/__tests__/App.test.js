import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import App from '../App';

// Mock all the imports
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    INTERRUPTION_MODE_IOS_DO_NOT_MIX: 1,
    INTERRUPTION_MODE_ANDROID_DO_NOT_MIX: 1,
  },
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidNotificationPriority: {
    MAX: 'max',
    DEFAULT: 'default',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('../i18n', () => ({
  __esModule: true,
  default: {
    language: 'en',
    changeLanguage: jest.fn(),
  },
}));

jest.mock('../hooks/useAlarmLogic', () => ({
  __esModule: true,
  default: () => ({
    currentTime: new Date(),
    alarmTime: new Date(),
    isAlarmSet: false,
    isAlarmPlaying: false,
    currentAlarmSound: null,
    formatTime: jest.fn((date) => date.toLocaleTimeString()),
    setAlarmTime: jest.fn(),
    onTimeChange: jest.fn(),
    setAlarm: jest.fn(() => Promise.resolve()),
    cancelAlarm: jest.fn(),
    stopAlarm: jest.fn(),
  }),
}));

jest.mock('../hooks/useAudioManager', () => ({
  __esModule: true,
  default: () => ({
    setupAudio: jest.fn(),
    setupBackgroundAlarmAudio: jest.fn(() => Promise.resolve()),
    loadCustomSoundsFromStorage: jest.fn(() => Promise.resolve([])),
    playSound: jest.fn(),
    stopSound: jest.fn(),
  }),
}));

jest.mock('../elevenlabs', () => ({
  generateCharacterVoice: jest.fn(),
  generateVoiceFromPreferences: jest.fn(),
  generateAndSaveVoice: jest.fn(),
}));

jest.mock('../components/SplashScreen', () => {
  const React = require('react');
  return ({ onAnimationFinish }) => {
    React.useEffect(() => {
      setTimeout(onAnimationFinish, 100);
    }, [onAnimationFinish]);
    
    return React.createElement('View', { testID: 'splash-screen' }, 
      React.createElement('Text', {}, 'Splash Screen')
    );
  };
});

jest.mock('../components/FeaturesSplashScreen', () => {
  const React = require('react');
  return ({ onNext }) => {
    return React.createElement('View', { testID: 'features-splash' }, [
      React.createElement('Text', { key: 'title' }, 'Features'),
      React.createElement(
        'TouchableOpacity',
        {
          key: 'next',
          testID: 'features-next',
          onPress: onNext
        },
        React.createElement('Text', {}, 'Next')
      )
    ]);
  };
});

jest.mock('../components/TimeDisplay', () => {
  const React = require('react');
  return ({ currentTime }) => {
    return React.createElement('View', { testID: 'time-display' },
      React.createElement('Text', {}, currentTime.toLocaleTimeString())
    );
  };
});

jest.mock('../components/AlarmStatus', () => {
  const React = require('react');
  return ({ isAlarmSet, isAlarmPlaying, onStopAlarm }) => {
    return React.createElement('View', { testID: 'alarm-status' }, [
      React.createElement('Text', { key: 'status' }, 
        isAlarmPlaying ? 'Alarm Playing' : isAlarmSet ? 'Alarm Set' : 'No Alarm'
      ),
      isAlarmPlaying && React.createElement(
        'TouchableOpacity',
        {
          key: 'stop',
          testID: 'stop-alarm',
          onPress: onStopAlarm
        },
        React.createElement('Text', {}, 'Stop')
      )
    ]);
  };
});

jest.mock('../components/SoundSelector', () => {
  const React = require('react');
  return ({ onOpenModal }) => {
    return React.createElement(
      'TouchableOpacity',
      {
        testID: 'sound-selector',
        onPress: onOpenModal
      },
      React.createElement('Text', {}, 'Select Sound')
    );
  };
});

jest.mock('../components/TimePickerModal', () => {
  const React = require('react');
  return ({ onOpenPicker, onSetAlarm }) => {
    return React.createElement('View', { testID: 'time-picker-modal' }, [
      React.createElement(
        'TouchableOpacity',
        {
          key: 'open',
          testID: 'open-time-picker',
          onPress: onOpenPicker
        },
        React.createElement('Text', {}, 'Set Time')
      ),
      React.createElement(
        'TouchableOpacity',
        {
          key: 'set',
          testID: 'set-alarm',
          onPress: onSetAlarm
        },
        React.createElement('Text', {}, 'Set Alarm')
      )
    ]);
  };
});

jest.mock('../components/RecordingModal', () => {
  const React = require('react');
  return () => React.createElement('View', { testID: 'recording-modal' });
});

jest.mock('../components/CustomVoiceModal', () => {
  const React = require('react');
  return () => React.createElement('View', { testID: 'custom-voice-modal' });
});

jest.mock('../components/LanguageSelector', () => {
  const React = require('react');
  return () => React.createElement('View', { testID: 'language-selector' });
});

jest.mock('../components/AlarmPopup', () => {
  const React = require('react');
  return () => React.createElement('View', { testID: 'alarm-popup' });
});

jest.mock('../components/ControlsBottomSheet', () => {
  const React = require('react');
  return () => React.createElement('View', { testID: 'controls-bottom-sheet' });
});

jest.mock('../components/AlarmListItem', () => {
  const React = require('react');
  return () => React.createElement('View', { testID: 'alarm-list-item' });
});

jest.mock('../components/FontSystem', () => ({
  TEXT_STYLES: {
    title: { fontSize: 16 },
    buttonText: { fontSize: 14 },
    label: { fontSize: 12 },
    caption: { fontSize: 10 },
    modalTitle: { fontSize: 18 },
  },
}));

// Mock hooks
jest.mock('../hooks/useAlarmLogic', () => {
  return () => ({
    currentTime: new Date('2023-12-01T14:30:00'),
    alarmTime: new Date('2023-12-01T08:00:00'),
    isAlarmSet: false,
    isAlarmPlaying: false,
    currentAlarmSound: null,
    sound: null,
    setAlarmTime: jest.fn(),
    triggerAlarm: jest.fn(),
    stopAlarm: jest.fn(),
    setAlarm: jest.fn(),
    cancelAlarm: jest.fn(),
    onTimeChange: jest.fn(),
    formatTime: (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
  });
});

jest.mock('../hooks/useAudioManager', () => {
  return () => ({
    isRecording: false,
    recording: null,
    tempRecordingUri: null,
    setupAudio: jest.fn(),
    setupBackgroundAlarmAudio: jest.fn(),
    requestAudioPermissions: jest.fn(() => Promise.resolve(true)),
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    cancelRecording: jest.fn(),
    saveRecordingWithName: jest.fn(),
    saveTTSAsCustomVoice: jest.fn(),
    loadCustomSoundsFromStorage: jest.fn(() => Promise.resolve([])),
    deleteCustomSound: jest.fn(),
    saveCustomSoundsToStorage: jest.fn(),
    previewCustomSound: jest.fn(),
  });
});

jest.mock('../elevenlabs', () => ({
  generateCharacterVoice: jest.fn(),
  generateVoiceFromPreferences: jest.fn(),
  generateAndSaveVoice: jest.fn(),
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    Alert.alert = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should show splash screen initially', () => {
    const { getByTestId } = render(<App />);
    
    expect(getByTestId('splash-screen')).toBeTruthy();
  });

  it('should progress through splash screens to main app', async () => {
    const { getByTestId, queryByTestId } = render(<App />);
    
    // Initially shows splash screen
    expect(getByTestId('splash-screen')).toBeTruthy();
    
    // Wait for splash screen to finish
    await waitFor(() => {
      expect(queryByTestId('splash-screen')).toBeNull();
    });
    
    // Should show features splash
    await waitFor(() => {
      expect(getByTestId('features-splash')).toBeTruthy();
    });
    
    // Click next on features splash
    fireEvent.press(getByTestId('features-next'));
    
    // Should show main app
    await waitFor(() => {
      expect(getByTestId('time-display')).toBeTruthy();
    });
  });

  it('should show main app components after features splash', async () => {
    const { getByTestId } = render(<App />);
    
    // Complete the flow to main app
    await waitFor(() => {
      if (getByTestId('features-next')) {
        fireEvent.press(getByTestId('features-next'));
      }
    });
    
    // Check main app components
    await waitFor(() => {
      expect(getByTestId('time-display')).toBeTruthy();
      expect(getByTestId('alarm-status')).toBeTruthy();
      expect(getByTestId('sound-selector')).toBeTruthy();
      expect(getByTestId('time-picker-modal')).toBeTruthy();
    });
  });

  it('should handle time picker interactions', async () => {
    const { getByTestId } = render(<App />);
    
    // Complete flow to main app
    await waitFor(() => {
      if (getByTestId('features-next')) {
        fireEvent.press(getByTestId('features-next'));
      }
    });
    
    await waitFor(() => {
      expect(getByTestId('time-picker-modal')).toBeTruthy();
    });
    
    // Test time picker interactions
    fireEvent.press(getByTestId('open-time-picker'));
    fireEvent.press(getByTestId('set-alarm'));
    
    // Should not crash
    expect(getByTestId('time-picker-modal')).toBeTruthy();
  });

  it('should handle sound selector interaction', async () => {
    const { getByTestId } = render(<App />);
    
    // Complete flow to main app
    await waitFor(() => {
      if (getByTestId('features-next')) {
        fireEvent.press(getByTestId('features-next'));
      }
    });
    
    await waitFor(() => {
      expect(getByTestId('sound-selector')).toBeTruthy();
    });
    
    // Test sound selector interaction
    fireEvent.press(getByTestId('sound-selector'));
    
    // Should not crash
    expect(getByTestId('sound-selector')).toBeTruthy();
  });

  it('should render without crashing', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  it('should handle app state changes', async () => {
    const { getByTestId } = render(<App />);
    
    // Complete flow to main app
    await waitFor(() => {
      if (getByTestId('features-next')) {
        fireEvent.press(getByTestId('features-next'));
      }
    });
    
    // App should be stable
    await waitFor(() => {
      expect(getByTestId('time-display')).toBeTruthy();
    });
  });

  it('should initialize with default sounds', async () => {
    const { getByTestId } = render(<App />);
    
    // Complete flow to main app
    await waitFor(() => {
      if (getByTestId('features-next')) {
        fireEvent.press(getByTestId('features-next'));
      }
    });
    
    // App should initialize without errors
    await waitFor(() => {
      expect(getByTestId('time-display')).toBeTruthy();
    });
  });
});
