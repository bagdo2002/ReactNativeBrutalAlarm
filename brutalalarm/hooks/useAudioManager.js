import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

/**
 * Custom Hook: useAudioManager
 *
 * Manages audio-related functionality including:
 * - Audio permissions and setup
 * - Sound recording and playback
 * - Custom sound storage and retrieval
 * - Sound file management
 *
 * @returns {Object} Audio state and control functions
 */
const useAudioManager = () => {
  const { t } = useTranslation();

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [tempRecordingUri, setTempRecordingUri] = useState(null);

  // Storage key for custom sounds
  const CUSTOM_SOUNDS_KEY = "@brutal_alarm_custom_sounds";

  /**
   * Sets up audio configuration on component mount and cleanup on unmount
   */
  useEffect(() => {
    setupAudio();
    
    // Cleanup function to run on component unmount
    return () => {
      console.log("Audio manager cleanup on unmount");
      if (recording) {
        recording.stopAndUnloadAsync().catch((error) => {
          console.log("Error during unmount cleanup:", error.message);
        });
      }
    };
  }, [recording]);

  /**
   * Configures audio mode for the app
   */
  const setupAudio = async () => {
    try {
      if (!Audio) return;
  
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
  
      console.log("Audio mode configured successfully");
    } catch (error) {
      console.error("Failed to configure audio mode:", error);
    }
  };

  /**
   * Setup audio specifically for background alarm playback
   */
  const setupBackgroundAlarmAudio = async () => {
    try {
      if (!Audio) return;
  
      // Enhanced background audio configuration
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        // Keep config minimal to avoid invalid values on newer SDKs
      });
  
      console.log("Enhanced background alarm audio mode configured successfully");
    } catch (error) {
      console.error("Failed to configure background alarm audio mode:", error);
    }
  };
  
  const startRecording = async () => {
    try {
      console.log("Starting recording...");
  
      // If already recording, don't start another one
      if (isRecording) {
        console.log("Already recording, ignoring start request");
        return;
      }

      // Clean up any existing recording object before starting new one
      if (recording) {
        console.log("Cleaning up existing recording object");
        try {
          await recording.stopAndUnloadAsync();
        } catch (cleanupError) {
          console.log("Error during cleanup (expected if recording was already stopped):", cleanupError.message);
        }
        setRecording(null);
      }
  
      const hasPermission = await requestAudioPermissions();
      if (!hasPermission) return;
  
      // Ensure audio mode is correct before recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      const recordingOptions = {
        isMeteringEnabled: true,
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2, // Try stereo for better compatibility
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MEDIUM, // Use medium instead of high for better compatibility
          sampleRate: 44100,
          numberOfChannels: 2, // Try stereo for better compatibility
          bitRate: 128000,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      };
  
      const { recording: newRecording } = await Audio.Recording.createAsync(
        recordingOptions
      );
  
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
  
      console.log("Recording started successfully");
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Recording Error", error.message || "Unknown error");
      setIsRecording(false);
      setRecording(null);
    }
  };
  

  /**
   * Requests audio permissions from the user
   */
  const requestAudioPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      console.log("Audio permission status:", status);

      if (status !== "granted") {
        Alert.alert(t("permissionRequired"), t("microphonePermissionMessage"));
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting audio permissions:", error);
      return false;
    }
  };

  /**
   * Starts audio recording
   */
  

  /**
   * Stops audio recording and returns the URI
   * @returns {string|null} Recording URI or null if failed
   */
  const stopRecording = async () => {
    try {
      console.log("Stopping recording...");

      if (!recording) {
        console.log("No recording to stop");
        setIsRecording(false);
        return null;
      }

      // Always reset recording state first to prevent multiple calls
      setIsRecording(false);

      // Check recording status before stopping
      let status;
      try {
        status = await recording.getStatusAsync();
        console.log("Recording status before stopping:", status);
      } catch (statusError) {
        console.log("Could not get recording status (may already be stopped):", statusError.message);
        // Continue with stopping attempt
      }

      // Get the URI before stopping (it might not be available after stopping)
      const uri = recording.getURI();
      console.log("Recording URI:", uri);

      // Stop and unload the recording
      await recording.stopAndUnloadAsync();
      console.log("Recording stopped successfully");

      // Clear the recording reference
      setRecording(null);

      if (!uri) {
        throw new Error("No recording URI found");
      }

      // Verify the file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log("Recording file info:", fileInfo);

      if (!fileInfo.exists) {
        throw new Error("Recording file was not created");
      }

      // Store temporarily
      setTempRecordingUri(uri);

      console.log("Recording stopped and URI stored");
      return uri;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      
      // Force reset state on any error
      setIsRecording(false);
      setRecording(null);
      
      Alert.alert(
        t("error"),
        t("failedToStopRecording") +
          "\n\nError: " +
          (error.message || "Unknown error")
      );
      return null;
    }
  };

  /**
   * Cancels current recording
   */
  const cancelRecording = async () => {
    try {
      console.log("Cancelling recording...");
      
      // Always reset the recording state first
      setIsRecording(false);
      
      // Stop and unload the recording if it exists
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
          console.log("Recording cancelled and stopped");
        } catch (stopError) {
          console.log("Error stopping recording during cancel (may already be stopped):", stopError.message);
        }
        setRecording(null);
      }

      // Clean up temporary recording
      if (tempRecordingUri) {
        try {
          await FileSystem.deleteAsync(tempRecordingUri, { idempotent: true });
          console.log("Temporary recording file deleted");
        } catch (deleteError) {
          console.error("Error deleting temporary recording:", deleteError);
        }
        setTempRecordingUri(null);
      }

      console.log("Recording cancelled successfully");
    } catch (error) {
      console.error("Error cancelling recording:", error);
      // Force reset state even if there were errors
      setIsRecording(false);
      setRecording(null);
      setTempRecordingUri(null);
    }
  };

  /**
   * Saves recording with a custom name
   * @param {string} name - Name for the recording
   * @param {Array} currentSounds - Current available sounds array
   * @returns {Object|null} New sound object or null if failed
   */
  const saveRecordingWithName = async (name, currentSounds) => {
    try {
      if (!name.trim()) {
        Alert.alert(t("nameRequired"), t("enterNameMessage"));
        return null;
      }

      if (!tempRecordingUri) {
        Alert.alert(t("error"), t("noRecordingFound"));
        return null;
      }

      const timestamp = new Date().getTime();
      const fileName = `custom_alarm_${timestamp}.m4a`;
      const documentDirectory = FileSystem.documentDirectory;
      const newPath = `${documentDirectory}${fileName}`;

      await FileSystem.moveAsync({
        from: tempRecordingUri,
        to: newPath,
      });

      // Create new sound object
      const newSound = {
        id: `custom_${timestamp}`,
        name: name.trim(),
        path: { uri: newPath },
        isCustom: true,
        text: t("customRecordedWakeUpCall"),
      };

      // Save to storage
      const updatedSounds = [...currentSounds, newSound];
      await saveCustomSoundsToStorage(updatedSounds);

      // Reset state
      setTempRecordingUri(null);

      Alert.alert(
        t("success"),
        t("recordingSavedMessage", { name: name.trim() })
      );

      return newSound;
    } catch (error) {
      console.error("Failed to save recording", error);
      Alert.alert(t("error"), t("failedToSaveRecording"));
      return null;
    }
  };

  /**
   * Saves custom sounds to AsyncStorage
   * @param {Array} sounds - Array of all sounds
   */
  const saveCustomSoundsToStorage = async (sounds) => {
    try {
      const customSounds = sounds.filter((sound) => sound.isCustom);
      await AsyncStorage.setItem(
        CUSTOM_SOUNDS_KEY,
        JSON.stringify(customSounds)
      );
      console.log("Custom sounds saved to storage");
    } catch (error) {
      console.error("Error saving custom sounds to storage:", error);
    }
  };

  /**
   * Loads custom sounds from AsyncStorage
   * @returns {Array} Array of valid custom sounds
   */
  const loadCustomSoundsFromStorage = async () => {
    try {
      const storedSounds = await AsyncStorage.getItem(CUSTOM_SOUNDS_KEY);
      if (storedSounds) {
        const parsedSounds = JSON.parse(storedSounds);

        // Verify files still exist
        const validSounds = [];
        for (const sound of parsedSounds) {
          if (sound.path && sound.path.uri) {
            try {
              const fileInfo = await FileSystem.getInfoAsync(sound.path.uri);
              if (fileInfo.exists) {
                validSounds.push(sound);
              } else {
                console.log(`File no longer exists: ${sound.path.uri}`);
              }
            } catch (fileError) {
              console.log(`Error checking file: ${sound.path.uri}`, fileError);
            }
          }
        }

        // Save cleaned up list back to storage if needed
        if (validSounds.length !== parsedSounds.length) {
          await AsyncStorage.setItem(
            CUSTOM_SOUNDS_KEY,
            JSON.stringify(validSounds)
          );
        }

        console.log(`Loaded ${validSounds.length} custom sounds from storage`);
        return validSounds;
      }
    } catch (error) {
      console.error("Error loading custom sounds from storage:", error);
    }
    return [];
  };

  /**
   * Saves TTS generated voice as a custom recording
   * @param {Object} ttsSound - TTS sound object from elevenlabs
   * @param {Array} currentSounds - Current available sounds array
   * @returns {Object|null} New sound object or null if failed
   */
  const saveTTSAsCustomVoice = async (ttsSound, currentSounds) => {
    try {
      if (!ttsSound) {
        Alert.alert(t("error"), t("noRecordingFound"));
        return null;
      }

      // Save to storage
      const updatedSounds = [...currentSounds, ttsSound];
      await saveCustomSoundsToStorage(updatedSounds);

      Alert.alert(
        t("success"),
        t("customVoiceSavedMessage", { name: ttsSound.name })
      );

      return ttsSound;
    } catch (error) {
      console.error("Failed to save TTS as custom voice", error);
      Alert.alert(t("error"), t("failedToSaveRecording"));
      return null;
    }
  };

  /**
   * Deletes a custom sound file and removes from storage
   * @param {string} soundId - ID of sound to delete
   * @param {Array} currentSounds - Current available sounds array
   * @returns {Array} Updated sounds array
   */
  const deleteCustomSound = async (soundId, currentSounds) => {
    try {
      // Find the sound to get the file path
      const soundToDelete = currentSounds.find((s) => s.id === soundId);

      // Delete the file from device storage
      if (soundToDelete && soundToDelete.path && soundToDelete.path.uri) {
        try {
          await FileSystem.deleteAsync(soundToDelete.path.uri, {
            idempotent: true,
          });
          console.log("Deleted file:", soundToDelete.path.uri);
        } catch (fileError) {
          console.error("Error deleting file:", fileError);
        }
      }

      // Remove from available sounds
      const updatedSounds = currentSounds.filter((s) => s.id !== soundId);

      // Save updated list to AsyncStorage
      await saveCustomSoundsToStorage(updatedSounds);

      console.log("Custom sound deleted successfully");
      return updatedSounds;
    } catch (error) {
      console.error("Error deleting custom sound:", error);
      Alert.alert(t("error"), t("failedToDeleteSound"));
      return currentSounds;
    }
  };

  /**
   * Plays a preview of a custom sound for testing
   * @param {Object} soundObject - The sound object to preview
   * @returns {Promise<boolean>} Success status
   */
  const previewCustomSound = async (soundObject) => {
    let sound = null;
    try {
      console.log("Starting preview for sound:", soundObject);
      
      if (!soundObject || !soundObject.path || !soundObject.path.uri) {
        console.error("Invalid sound object for preview:", soundObject);
        Alert.alert(t("error"), t("noRecordingFound"));
        return false;
      }

      // Check if file exists
      console.log("Checking file existence at:", soundObject.path.uri);
      const fileInfo = await FileSystem.getInfoAsync(soundObject.path.uri);
      console.log("File info:", fileInfo);
      
      if (!fileInfo.exists) {
        console.error("File does not exist:", soundObject.path.uri);
        Alert.alert(t("error"), t("fileNotFound"));
        return false;
      }

      // For recorded files, we need to completely reset the audio session
      console.log("Resetting audio session for preview");
      
      // First, set a neutral audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Wait a moment for the audio session to reset
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("Creating audio sound for preview");
      
      // Use the simplest possible configuration for maximum compatibility
      const { sound: newSound } = await Audio.Sound.createAsync(
        soundObject.path,
        {
          shouldPlay: true, // Try auto-play immediately
          isLooping: false,
          volume: 1.0,
        }
      );

      sound = newSound;

      console.log("Audio created and should be playing");
      
      // Check status after a brief delay
      setTimeout(async () => {
        try {
          if (sound) {
            const status = await sound.getStatusAsync();
            console.log("Preview status after 1 second:", status);
            
            if (status.isLoaded && !status.isPlaying) {
              console.log("Audio not playing, attempting manual play");
              await sound.playAsync();
              
              // Check again after manual play attempt
              setTimeout(async () => {
                try {
                  const retryStatus = await sound.getStatusAsync();
                  console.log("Status after manual play:", retryStatus);
                  if (!retryStatus.isPlaying) {
                    console.error("Failed to start audio playback - possible format/codec issue");
                    Alert.alert(t("error"), "Audio file may be corrupted or in an unsupported format");
                  }
                } catch (e) {
                  console.error("Error checking retry status:", e);
                }
              }, 500);
            }
          }
        } catch (statusError) {
          console.error("Error checking preview status:", statusError);
        }
      }, 1000);

      // Auto-stop after 10 seconds
      setTimeout(async () => {
        try {
          if (sound) {
            console.log("Auto-stopping preview after 10 seconds");
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
              if (status.isPlaying) {
                await sound.stopAsync();
              }
              await sound.unloadAsync();
            }
            sound = null;
          }
        } catch (e) {
          console.error("Error during auto-stop:", e);
        }
      }, 10000);

      return true;
    } catch (error) {
      console.error("Error previewing custom sound:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        soundPath: soundObject?.path?.uri,
        isCustomVoice: soundObject?.isCustomVoice,
        fileExtension: soundObject?.path?.uri?.split('.').pop(),
        fileSize: await FileSystem.getInfoAsync(soundObject?.path?.uri).then(info => info.size).catch(() => 'unknown')
      });

      // Clean up on error
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (cleanupError) {
          console.error("Error during cleanup:", cleanupError);
        }
      }

      Alert.alert(t("error"), `Preview failed: ${error.message}`);
      return false;
    }
  };

  return {
    // State
    isRecording,
    recording,
    tempRecordingUri,

    // Actions
    setupAudio,
    setupBackgroundAlarmAudio,
    requestAudioPermissions,
    startRecording,
    stopRecording,
    cancelRecording,
    saveRecordingWithName,
    saveTTSAsCustomVoice,
    loadCustomSoundsFromStorage,
    deleteCustomSound,
    saveCustomSoundsToStorage,
    previewCustomSound,
  };
};

export default useAudioManager;
