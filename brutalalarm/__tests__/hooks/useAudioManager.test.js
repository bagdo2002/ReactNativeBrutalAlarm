import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAudioManager from '../../hooks/useAudioManager';

describe('useAudioManager Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert = jest.fn();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useAudioManager());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.recording).toBe(null);
    expect(result.current.tempRecordingUri).toBe(null);
  });

  it('should setup audio mode correctly', async () => {
    const { result } = renderHook(() => useAudioManager());

    await act(async () => {
      await result.current.setupAudio();
    });

    expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  });

  it('should setup background alarm audio mode correctly', async () => {
    const { result } = renderHook(() => useAudioManager());

    await act(async () => {
      await result.current.setupBackgroundAlarmAudio();
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
    const { result } = renderHook(() => useAudioManager());

    const hasPermission = await act(async () => {
      return await result.current.requestAudioPermissions();
    });

    expect(Audio.requestPermissionsAsync).toHaveBeenCalled();
    expect(hasPermission).toBe(true);
  });

  it('should handle denied audio permissions', async () => {
    Audio.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const { result } = renderHook(() => useAudioManager());

    const hasPermission = await act(async () => {
      return await result.current.requestAudioPermissions();
    });

    expect(hasPermission).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      'permissionRequired',
      'microphonePermissionMessage'
    );
  });

  it('should start recording successfully', async () => {
    const mockRecording = {
      startAsync: jest.fn(),
      stopAndUnloadAsync: jest.fn(),
      getStatusAsync: jest.fn(() => Promise.resolve({ isRecording: true })),
      getURI: jest.fn(() => 'file://test-recording.m4a'),
    };

    Audio.Recording.createAsync.mockResolvedValueOnce({
      recording: mockRecording,
    });

    const { result } = renderHook(() => useAudioManager());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);
    expect(result.current.recording).toBeDefined();
    expect(Audio.Recording.createAsync).toHaveBeenCalled();
    expect(mockRecording.startAsync).toHaveBeenCalled();
  });

  it('should not start recording if already recording', async () => {
    const { result } = renderHook(() => useAudioManager());

    // Mock that recording is already in progress
    await act(async () => {
      result.current.isRecording = true;
      await result.current.startRecording();
    });

    expect(Audio.Recording.createAsync).not.toHaveBeenCalled();
  });

  it('should stop recording and return URI', async () => {
    const mockRecording = {
      startAsync: jest.fn(),
      stopAndUnloadAsync: jest.fn(),
      getStatusAsync: jest.fn(() => Promise.resolve({ isRecording: false })),
      getURI: jest.fn(() => 'file://test-recording.m4a'),
    };

    const { result } = renderHook(() => useAudioManager());

    // Set up recording state
    await act(async () => {
      result.current.recording = mockRecording;
      result.current.isRecording = true;
    });

    const uri = await act(async () => {
      return await result.current.stopRecording();
    });

    expect(uri).toBe('file://test-recording.m4a');
    expect(result.current.isRecording).toBe(false);
    expect(result.current.recording).toBe(null);
    expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
    expect(FileSystem.getInfoAsync).toHaveBeenCalledWith('file://test-recording.m4a');
  });

  it('should cancel recording and clean up', async () => {
    const mockRecording = {
      stopAndUnloadAsync: jest.fn(),
    };

    const { result } = renderHook(() => useAudioManager());

    await act(async () => {
      result.current.recording = mockRecording;
      result.current.isRecording = true;
      result.current.tempRecordingUri = 'file://temp-recording.m4a';
      await result.current.cancelRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.recording).toBe(null);
    expect(result.current.tempRecordingUri).toBe(null);
    expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
      'file://temp-recording.m4a',
      { idempotent: true }
    );
  });

  it('should save recording with name', async () => {
    const { result } = renderHook(() => useAudioManager());
    const mockSounds = [];

    await act(async () => {
      result.current.tempRecordingUri = 'file://temp-recording.m4a';
    });

    const newSound = await act(async () => {
      return await result.current.saveRecordingWithName('Test Recording', mockSounds);
    });

    expect(newSound).toBeDefined();
    expect(newSound.name).toBe('Test Recording');
    expect(newSound.isCustom).toBe(true);
    expect(FileSystem.moveAsync).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'success',
      expect.stringContaining('Test Recording')
    );
  });

  it('should not save recording without name', async () => {
    const { result } = renderHook(() => useAudioManager());

    const newSound = await act(async () => {
      return await result.current.saveRecordingWithName('', []);
    });

    expect(newSound).toBe(null);
    expect(Alert.alert).toHaveBeenCalledWith('nameRequired', 'enterNameMessage');
  });

  it('should not save recording without temp URI', async () => {
    const { result } = renderHook(() => useAudioManager());

    const newSound = await act(async () => {
      return await result.current.saveRecordingWithName('Test', []);
    });

    expect(newSound).toBe(null);
    expect(Alert.alert).toHaveBeenCalledWith('error', 'noRecordingFound');
  });

  it('should load custom sounds from storage', async () => {
    const mockSounds = [
      {
        id: 'custom_123',
        name: 'My Recording',
        path: { uri: 'file://recording.m4a' },
        isCustom: true,
      },
    ];

    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockSounds));
    const { result } = renderHook(() => useAudioManager());

    const loadedSounds = await act(async () => {
      return await result.current.loadCustomSoundsFromStorage();
    });

    expect(loadedSounds).toEqual(mockSounds);
    expect(FileSystem.getInfoAsync).toHaveBeenCalledWith('file://recording.m4a');
  });

  it('should filter out non-existent files when loading sounds', async () => {
    const mockSounds = [
      {
        id: 'custom_123',
        name: 'Existing Recording',
        path: { uri: 'file://existing.m4a' },
        isCustom: true,
      },
      {
        id: 'custom_456',
        name: 'Missing Recording',
        path: { uri: 'file://missing.m4a' },
        isCustom: true,
      },
    ];

    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockSounds));
    FileSystem.getInfoAsync
      .mockResolvedValueOnce({ exists: true })
      .mockResolvedValueOnce({ exists: false });

    const { result } = renderHook(() => useAudioManager());

    const loadedSounds = await act(async () => {
      return await result.current.loadCustomSoundsFromStorage();
    });

    expect(loadedSounds).toHaveLength(1);
    expect(loadedSounds[0].name).toBe('Existing Recording');
  });

  it('should delete custom sound', async () => {
    const mockSounds = [
      {
        id: 'custom_123',
        name: 'Recording to Delete',
        path: { uri: 'file://delete-me.m4a' },
        isCustom: true,
      },
      {
        id: 'custom_456',
        name: 'Keep This Recording',
        path: { uri: 'file://keep-me.m4a' },
        isCustom: true,
      },
    ];

    const { result } = renderHook(() => useAudioManager());

    const updatedSounds = await act(async () => {
      return await result.current.deleteCustomSound('custom_123', mockSounds);
    });

    expect(updatedSounds).toHaveLength(1);
    expect(updatedSounds[0].name).toBe('Keep This Recording');
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
      'file://delete-me.m4a',
      { idempotent: true }
    );
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should save TTS as custom voice', async () => {
    const mockTTSSound = {
      id: 'tts_123',
      name: 'Navy SEAL Voice',
      path: { uri: 'file://tts-voice.mp3' },
      isCustom: true,
      isCustomVoice: true,
    };

    const { result } = renderHook(() => useAudioManager());

    const savedSound = await act(async () => {
      return await result.current.saveTTSAsCustomVoice(mockTTSSound, []);
    });

    expect(savedSound).toEqual(mockTTSSound);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'success',
      expect.stringContaining('Navy SEAL Voice')
    );
  });

  it('should preview custom sound', async () => {
    const mockSoundObject = {
      id: 'custom_123',
      name: 'Test Sound',
      path: { uri: 'file://test-sound.m4a' },
      isCustom: true,
    };

    const { result } = renderHook(() => useAudioManager());

    const success = await act(async () => {
      return await result.current.previewCustomSound(mockSoundObject);
    });

    expect(success).toBe(true);
    expect(FileSystem.getInfoAsync).toHaveBeenCalledWith('file://test-sound.m4a');
    expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
      mockSoundObject.path,
      expect.objectContaining({
        shouldPlay: true,
        isLooping: false,
        volume: 1.0,
      })
    );
  });

  it('should handle preview error for invalid sound object', async () => {
    const { result } = renderHook(() => useAudioManager());

    const success = await act(async () => {
      return await result.current.previewCustomSound(null);
    });

    expect(success).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith('error', 'noRecordingFound');
  });

  it('should handle preview error for non-existent file', async () => {
    FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: false });

    const mockSoundObject = {
      id: 'custom_123',
      name: 'Missing Sound',
      path: { uri: 'file://missing-sound.m4a' },
      isCustom: true,
    };

    const { result } = renderHook(() => useAudioManager());

    const success = await act(async () => {
      return await result.current.previewCustomSound(mockSoundObject);
    });

    expect(success).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith('error', 'fileNotFound');
  });
});
