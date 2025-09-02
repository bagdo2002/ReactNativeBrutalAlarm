import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import useAlarmLogic from '../../hooks/useAlarmLogic';
import useAudioManager from '../../hooks/useAudioManager';

describe('Alarm Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    Alert.alert = jest.fn();
  });

  afterEach(() => {
    // Ensure all async operations complete before switching to real timers
    jest.runAllTimers();
    jest.useRealTimers();
  });

  describe('Complete Alarm Setting Flow', () => {
    it('should complete full alarm setting workflow', async () => {
      const { result: alarmLogic } = renderHook(() => useAlarmLogic());
      const { result: audioManager } = renderHook(() => useAudioManager());

      // Step 1: Set alarm time
      const alarmTime = new Date();
      alarmTime.setHours(alarmTime.getHours() + 1);

      await act(async () => {
        alarmLogic.current.setAlarmTime(alarmTime);
      });

      expect(alarmLogic.current.alarmTime).toEqual(alarmTime);

      // Step 2: Create a sound (simulate recording)
      await act(async () => {
        await audioManager.current.startRecording();
      });

      expect(audioManager.current.isRecording).toBe(true);

      const recordingUri = await act(async () => {
        return await audioManager.current.stopRecording();
      });

      expect(recordingUri).toBeDefined();
      expect(audioManager.current.isRecording).toBe(false);

      // Step 3: Save the recording
      const mockSounds = [];
      const newSound = await act(async () => {
        return await audioManager.current.saveRecordingWithName('Test Alarm', mockSounds);
      });

      expect(newSound).toBeDefined();
      expect(newSound.name).toBe('Test Alarm');
      expect(newSound.isCustom).toBe(true);

      // Step 4: Set alarm with the new sound
      await act(async () => {
        await alarmLogic.current.setAlarm(newSound);
      });

      expect(alarmLogic.current.isAlarmSet).toBe(true);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining('alarmSet'),
        expect.any(String)
      );
    });

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
  });

  describe('Error Handling in Alarm Flow', () => {
    it('should handle recording failure gracefully', async () => {
      Audio.Recording.createAsync.mockRejectedValueOnce(new Error('Recording failed'));
      
      const { result: audioManager } = renderHook(() => useAudioManager());

      await act(async () => {
        await audioManager.current.startRecording();
      });

      expect(audioManager.current.isRecording).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Recording Error',
        'Recording failed'
      );
    });

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
  });

  describe('Custom Sound Management Flow', () => {
    it('should complete custom sound creation and deletion flow', async () => {
      const { result: audioManager } = renderHook(() => useAudioManager());

      // Step 1: Create custom sound
      const mockSounds = [];
      const newSound = await act(async () => {
        audioManager.current.tempRecordingUri = 'file://test-recording.m4a';
        return await audioManager.current.saveRecordingWithName('Custom Sound', mockSounds);
      });

      expect(newSound).toBeDefined();
      expect(newSound.name).toBe('Custom Sound');

      // Step 2: Add to sounds list
      const updatedSounds = [newSound];

      // Step 3: Delete the custom sound
      const finalSounds = await act(async () => {
        return await audioManager.current.deleteCustomSound(newSound.id, updatedSounds);
      });

      expect(finalSounds).toHaveLength(0);
    });

    it('should handle sound preview flow', async () => {
      const { result: audioManager } = renderHook(() => useAudioManager());

      const mockSound = {
        id: 'custom-sound',
        name: 'Test Sound',
        path: { uri: 'file://test-sound.m4a' },
        isCustom: true,
      };

      let success;
      await act(async () => {
        success = await audioManager.current.previewCustomSound(mockSound);
      });

      expect(success).toBe(true);
      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        mockSound.path,
        expect.objectContaining({
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
        })
      );
    }, 10000);
  });

  describe('Alarm Scheduling and Notifications', () => {
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

    it('should handle alarm cancellation properly', async () => {
      const { result: alarmLogic } = renderHook(() => useAlarmLogic());

      const testSound = {
        id: 'test-sound',
        name: 'Test Sound',
        text: 'Wake up!',
        path: require('../../assets/audio/trakiawi.m4a'),
        isCustom: false,
      };

      // Set alarm first
      await act(async () => {
        await alarmLogic.current.setAlarm(testSound);
      });

      expect(alarmLogic.current.isAlarmSet).toBe(true);

      // Cancel alarm
      await act(async () => {
        await alarmLogic.current.cancelAlarm();
      });

      expect(alarmLogic.current.isAlarmSet).toBe(false);
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(2);
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining('alarmCancelled'),
        expect.any(String)
      );
    });
  });

  describe('Time Management', () => {
    it('should handle time changes correctly', async () => {
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
});
