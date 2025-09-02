import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import useAlarmLogic from '../../hooks/useAlarmLogic';
import useAudioManager from '../../hooks/useAudioManager';

describe('Alarm Flow Integration Tests - Fixed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    Alert.alert = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Core Alarm Functionality', () => {
    it('should handle alarm triggering and stopping flow', async () => {
      const { result: alarmLogic } = renderHook(() => useAlarmLogic());

      const testSound = {
        id: 'test-sound',
        name: 'Test Sound',
        text: 'Wake up!',
        path: require('../../assets/audio/trakiawi.m4a'),
        isCustom: false,
      };

      // Step 1: Trigger alarm
      await act(async () => {
        await alarmLogic.current.triggerAlarm(testSound);
      });

      expect(alarmLogic.current.isAlarmPlaying).toBe(true);
      expect(alarmLogic.current.currentAlarmSound).toEqual(testSound);

      // Step 2: Stop alarm
      await act(async () => {
        await alarmLogic.current.stopAlarm();
      });

      expect(alarmLogic.current.isAlarmPlaying).toBe(false);
      expect(alarmLogic.current.currentAlarmSound).toBe(null);
      expect(alarmLogic.current.isAlarmSet).toBe(false);
    });

    it('should handle alarm auto-stop after timeout', async () => {
      const { result: alarmLogic } = renderHook(() => useAlarmLogic());

      const testSound = {
        id: 'test-sound',
        name: 'Test Sound',
        text: 'Wake up!',
        path: require('../../assets/audio/trakiawi.m4a'),
        isCustom: false,
      };

      // Trigger alarm
      await act(async () => {
        await alarmLogic.current.triggerAlarm(testSound);
      });

      expect(alarmLogic.current.isAlarmPlaying).toBe(true);

      // Fast-forward time to trigger auto-stop (60 seconds)
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(alarmLogic.current.isAlarmPlaying).toBe(false);
    });

    it('should set alarm and schedule notifications', async () => {
      const { result: alarmLogic } = renderHook(() => useAlarmLogic());

      const testSound = {
        id: 'test-sound',
        name: 'Test Sound',
        text: 'Wake up!',
        path: require('../../assets/audio/trakiawi.m4a'),
        isCustom: false,
      };

      await act(async () => {
        await alarmLogic.current.setAlarm(testSound);
      });

      expect(alarmLogic.current.isAlarmSet).toBe(true);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining('alarmSet'),
        expect.any(String)
      );
    });

    it('should cancel alarm correctly', async () => {
      const { result: alarmLogic } = renderHook(() => useAlarmLogic());

      const testSound = {
        id: 'test-sound',
        name: 'Test Sound',
        text: 'Wake up!',
        path: require('../../assets/audio/trakiawi.m4a'),
        isCustom: false,
      };

      // First set an alarm
      await act(async () => {
        await alarmLogic.current.setAlarm(testSound);
      });

      expect(alarmLogic.current.isAlarmSet).toBe(true);

      // Then cancel it
      await act(async () => {
        await alarmLogic.current.cancelAlarm();
      });

      expect(alarmLogic.current.isAlarmSet).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining('alarmCancelled'),
        expect.any(String)
      );
    });
  });

  describe('Audio Management', () => {
    it('should handle audio setup correctly', async () => {
      const { result: audioManager } = renderHook(() => useAudioManager());

      await act(async () => {
        await audioManager.current.setupAudio();
      });

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    });

    it('should handle background alarm audio setup', async () => {
      const { result: audioManager } = renderHook(() => useAudioManager());

      await act(async () => {
        await audioManager.current.setupBackgroundAlarmAudio();
      });

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
    });

    it('should request audio permissions', async () => {
      const { result: audioManager } = renderHook(() => useAudioManager());

      const hasPermission = await act(async () => {
        return await audioManager.current.requestAudioPermissions();
      });

      expect(Audio.requestPermissionsAsync).toHaveBeenCalled();
      expect(hasPermission).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle notification scheduling failure', async () => {
      Notifications.scheduleNotificationAsync.mockRejectedValueOnce(
        new Error('Notification failed')
      );

      const { result: alarmLogic } = renderHook(() => useAlarmLogic());

      const testSound = {
        id: 'test-sound',
        name: 'Test Sound',
        text: 'Wake up!',
        path: require('../../assets/audio/trakiawi.m4a'),
        isCustom: false,
      };

      // Should still set alarm even if notification fails
      await act(async () => {
        await alarmLogic.current.setAlarm(testSound);
      });

      expect(alarmLogic.current.isAlarmSet).toBe(true);
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining('alarmSet'),
        expect.any(String)
      );
    });

    it('should handle audio playback failure during alarm', async () => {
      Audio.Sound.createAsync.mockRejectedValueOnce(new Error('Audio failed'));

      const { result: alarmLogic } = renderHook(() => useAlarmLogic());

      const testSound = {
        id: 'test-sound',
        name: 'Test Sound',
        text: 'Wake up!',
        path: require('../../assets/audio/trakiawi.m4a'),
        isCustom: false,
      };

      await act(async () => {
        await alarmLogic.current.triggerAlarm(testSound);
      });

      // Should still set alarm playing state and show alert
      expect(alarmLogic.current.isAlarmPlaying).toBe(true);
      expect(Alert.alert).toHaveBeenCalledWith('wakeUp', 'Wake up!');
    });

    it('should handle denied audio permissions', async () => {
      Audio.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
      const { result: audioManager } = renderHook(() => useAudioManager());

      const hasPermission = await act(async () => {
        return await audioManager.current.requestAudioPermissions();
      });

      expect(hasPermission).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        'permissionRequired',
        'microphonePermissionMessage'
      );
    });
  });

  describe('Time Management', () => {
    it('should handle time changes correctly', () => {
      const { result: alarmLogic } = renderHook(() => useAlarmLogic());

      const newTime = new Date('2023-12-01T09:00:00');

      act(() => {
        alarmLogic.current.onTimeChange(null, newTime);
      });

      expect(alarmLogic.current.alarmTime).toEqual(newTime);
    });

    it('should format time consistently', () => {
      const { result: alarmLogic } = renderHook(() => useAlarmLogic());

      const testTime = new Date('2023-12-01T14:30:00');
      const formattedTime = alarmLogic.current.formatTime(testTime);

      expect(formattedTime).toBe('02:30 PM');
    });

    it('should update current time regularly', () => {
      const { result: alarmLogic } = renderHook(() => useAlarmLogic());
      
      const initialTime = alarmLogic.current.currentTime;

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(alarmLogic.current.currentTime.getTime()).toBeGreaterThan(initialTime.getTime());
    });
  });

  describe('Notification Scheduling', () => {
    it('should schedule multiple backup notifications', async () => {
      const { result: alarmLogic } = renderHook(() => useAlarmLogic());

      const testSound = {
        id: 'test-sound',
        name: 'Test Sound',
        text: 'Wake up!',
        path: require('../../assets/audio/trakiawi.m4a'),
        isCustom: false,
      };

      await act(async () => {
        await alarmLogic.current.setAlarm(testSound);
      });

      // Should schedule main notification + 8 backup notifications
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(9);
    });

    it('should cancel existing notifications when setting new alarm', async () => {
      const { result: alarmLogic } = renderHook(() => useAlarmLogic());

      const testSound = {
        id: 'test-sound',
        name: 'Test Sound',
        text: 'Wake up!',
        path: require('../../assets/audio/trakiawi.m4a'),
        isCustom: false,
      };

      await act(async () => {
        await alarmLogic.current.setAlarm(testSound);
      });

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();

      // Set another alarm
      await act(async () => {
        await alarmLogic.current.setAlarm(testSound);
      });

      // Should cancel notifications again
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(2);
    });
  });
});
