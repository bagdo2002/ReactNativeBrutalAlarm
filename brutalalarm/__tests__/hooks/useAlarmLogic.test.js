import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import useAlarmLogic from '../../hooks/useAlarmLogic';

// Mock dependencies

jest.mock('../../elevenlabs', () => ({
  generateVoiceFromPreferences: jest.fn(),
}));

describe('useAlarmLogic Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    Alert.alert = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useAlarmLogic());

    expect(result.current.isAlarmSet).toBe(false);
    expect(result.current.isAlarmPlaying).toBe(false);
    expect(result.current.currentAlarmSound).toBe(null);
    expect(result.current.currentTime).toBeInstanceOf(Date);
    expect(result.current.alarmTime).toBeInstanceOf(Date);
  });

  it('should update current time every second', () => {
    const { result } = renderHook(() => useAlarmLogic());
    const initialTime = result.current.currentTime;

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.currentTime.getTime()).toBeGreaterThan(initialTime.getTime());
  });

  it('should format time correctly', () => {
    const { result } = renderHook(() => useAlarmLogic());
    const testDate = new Date(2023, 0, 1, 14, 30, 0); // 2:30 PM

    const formattedTime = result.current.formatTime(testDate);
    expect(formattedTime).toBe('02:30 PM');
  });

  it('should set alarm time correctly', () => {
    const { result } = renderHook(() => useAlarmLogic());
    const testTime = new Date(2023, 0, 1, 8, 0, 0);

    act(() => {
      result.current.setAlarmTime(testTime);
    });

    expect(result.current.alarmTime).toEqual(testTime);
  });

  it('should handle time picker changes', () => {
    const { result } = renderHook(() => useAlarmLogic());
    const testTime = new Date(2023, 0, 1, 9, 0, 0);

    act(() => {
      result.current.onTimeChange(null, testTime);
    });

    expect(result.current.alarmTime).toEqual(testTime);
  });

  it('should set alarm and schedule notifications', async () => {
    const { result } = renderHook(() => useAlarmLogic());
    const mockSound = {
      id: 'test-sound',
      name: 'Test Sound',
      text: 'Wake up!',
      path: require('../../assets/audio/trakiawi.m4a'),
      isCustom: false,
    };

    await act(async () => {
      await result.current.setAlarm(mockSound);
    });

    expect(result.current.isAlarmSet).toBe(true);
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    // Note: No alert is shown when setting alarm - this is handled by the multi-alarm system
  });

  it('should cancel alarm correctly', async () => {
    const { result } = renderHook(() => useAlarmLogic());
    const mockSound = {
      id: 'test-sound',
      name: 'Test Sound',
      text: 'Wake up!',
      path: require('../../assets/audio/trakiawi.m4a'),
      isCustom: false,
    };

    // First set an alarm
    await act(async () => {
      await result.current.setAlarm(mockSound);
    });

    expect(result.current.isAlarmSet).toBe(true);

    // Then cancel it
    await act(async () => {
      await result.current.cancelAlarm();
    });

    expect(result.current.isAlarmSet).toBe(false);
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(2);
    expect(Alert.alert).toHaveBeenCalledWith(
      expect.stringContaining('alarmCancelled'),
      expect.any(String)
    );
  });

  it('should trigger alarm with valid sound', async () => {
    const { result } = renderHook(() => useAlarmLogic());
    const mockSound = {
      id: 'test-sound',
      name: 'Test Sound',
      text: 'Wake up!',
      path: require('../../assets/audio/trakiawi.m4a'),
      isCustom: false,
    };

    await act(async () => {
      await result.current.triggerAlarm(mockSound);
    });

    expect(result.current.isAlarmPlaying).toBe(true);
    expect(result.current.currentAlarmSound).toEqual(mockSound);
  });

  it('should trigger alarm with fallback sound when no sound provided', async () => {
    const { result } = renderHook(() => useAlarmLogic());

    await act(async () => {
      await result.current.triggerAlarm(null);
    });

    expect(result.current.isAlarmPlaying).toBe(true);
    expect(result.current.currentAlarmSound).toBeDefined();
    expect(result.current.currentAlarmSound.id).toBe('fallback');
  });

  it('should stop alarm correctly', async () => {
    const { result } = renderHook(() => useAlarmLogic());
    const mockSound = {
      id: 'test-sound',
      name: 'Test Sound',
      text: 'Wake up!',
      path: require('../../assets/audio/trakiawi.m4a'),
      isCustom: false,
    };

    // First trigger an alarm
    await act(async () => {
      await result.current.triggerAlarm(mockSound);
    });

    expect(result.current.isAlarmPlaying).toBe(true);

    // Then stop it
    await act(async () => {
      await result.current.stopAlarm();
    });

    expect(result.current.isAlarmPlaying).toBe(false);
    expect(result.current.currentAlarmSound).toBe(null);
    expect(result.current.isAlarmSet).toBe(false);
  });

  it('should auto-stop alarm after 1 minute', async () => {
    const { result } = renderHook(() => useAlarmLogic());
    const mockSound = {
      id: 'test-sound',
      name: 'Test Sound',
      text: 'Wake up!',
      path: require('../../assets/audio/trakiawi.m4a'),
      isCustom: false,
    };

    await act(async () => {
      await result.current.triggerAlarm(mockSound);
    });

    expect(result.current.isAlarmPlaying).toBe(true);

    // Fast-forward 60 seconds
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(result.current.isAlarmPlaying).toBe(false);
  });

  it('should handle custom recording with URI path', async () => {
    const { result } = renderHook(() => useAlarmLogic());
    const mockCustomSound = {
      id: 'custom-sound',
      name: 'My Recording',
      text: 'Custom wake up call',
      path: { uri: 'file://custom-recording.m4a' },
      isCustom: true,
    };

    await act(async () => {
      await result.current.triggerAlarm(mockCustomSound);
    });

    expect(result.current.isAlarmPlaying).toBe(true);
    expect(result.current.currentAlarmSound).toEqual(mockCustomSound);
  });

  it('should schedule backup notifications for alarm', async () => {
    const { result } = renderHook(() => useAlarmLogic());
    const mockSound = {
      id: 'test-sound',
      name: 'Test Sound',
      text: 'Wake up!',
      path: require('../../assets/audio/trakiawi.m4a'),
      isCustom: false,
    };

    await act(async () => {
      await result.current.setAlarm(mockSound);
    });

    // Should schedule main notification plus 8 backup notifications (9 total)
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(9);
  });

  it('should handle alarm time for next day if time has passed', async () => {
    const { result } = renderHook(() => useAlarmLogic());
    const pastTime = new Date();
    pastTime.setHours(pastTime.getHours() - 1); // 1 hour ago

    const mockSound = {
      id: 'test-sound',
      name: 'Test Sound',
      text: 'Wake up!',
      path: require('../../assets/audio/trakiawi.m4a'),
      isCustom: false,
    };

    act(() => {
      result.current.setAlarmTime(pastTime);
    });

    await act(async () => {
      await result.current.setAlarm(mockSound);
    });

    expect(result.current.isAlarmSet).toBe(true);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });
});
