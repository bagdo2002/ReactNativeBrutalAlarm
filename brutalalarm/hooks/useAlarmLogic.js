import { useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';

import { generateVoiceFromPreferences } from '../elevenlabs';

/**
 * Custom Hook: useAlarmLogic
 * 
 * Manages all alarm-related state and logic including:
 * - Current time tracking
 * - Alarm time management
 * - Alarm triggering and stopping
 * - Audio playback
 * - Notification scheduling
 * 
 * @returns {Object} Alarm state and control functions
 */
const useAlarmLogic = () => {
  const { t } = useTranslation();
  
  // Time and alarm state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [currentAlarmSound, setCurrentAlarmSound] = useState(null);
  const [sound, setSound] = useState(null);
  const [storedAlarmSound, setStoredAlarmSound] = useState(null);
  
  // Refs for interval management
  const intervalRef = useRef(null);
  const timeUpdateRef = useRef(null);
  const alarmTriggerCallbackRef = useRef(null);

  /**
   * Formats time to display format (12-hour with AM/PM)
   * @param {Date} date - Date object to format
   * @returns {string} Formatted time string
   */
  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /**
   * Updates current time every second
   */
  useEffect(() => {
    timeUpdateRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    };
  }, []);

  /**
   * Monitors for alarm trigger conditions
   * Checks every second if current time matches alarm time
   * NOTE: This automatic triggering is disabled for multi-alarm system
   * Alarms are now managed by the notification system in App.js
   */
  useEffect(() => {
    // Disable automatic alarm triggering for multi-alarm system
    // Alarms are now managed by notifications and the multi-alarm system
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAlarmSet, alarmTime, isAlarmPlaying, storedAlarmSound]);

  /**
   * Triggers the alarm with audio and character voice
   * @param {Object} selectedSound - The sound object to play
   */
  const triggerAlarm = async (selectedSound, onAlarmTriggered) => {
    try {
      console.log("Triggering alarm with sound:", selectedSound);
      
      // Ensure we have a valid sound object
      if (!selectedSound) {
        console.warn("triggerAlarm called with undefined sound, creating fallback");
        selectedSound = {
          id: "fallback",
          name: t("defaultAlarmSounds.trakiawi.name"),
          text: t("defaultAlarmSounds.trakiawi.text"),
          path: require("../assets/audio/trakiawi.m4a"),
          isCustom: false
        };
      }
      
      setCurrentAlarmSound(selectedSound);
      setIsAlarmPlaying(true);

      // Call the callback to show alarm popup if provided
      if (onAlarmTriggered) {
        onAlarmTriggered(selectedSound);
      }

      // Play audio if available
      if (selectedSound?.path && selectedSound.path !== null) {
        try {
          console.log("Attempting to play audio:", selectedSound.name, selectedSound.path);
          console.log("Audio path type:", typeof selectedSound.path);
          console.log("Audio path value:", selectedSound.path);

          // Enhanced audio mode configuration for background playback
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: false,
            playThroughEarpieceAndroid: false,
            // Additional settings for better background audio
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            // Enable audio session to stay active
            shouldCorrectPitch: false,
          });
          console.log("Enhanced audio mode set successfully for alarm playback");

          // Handle different path types (require vs uri)
          let audioSource = selectedSound.path;
          
          // Check if it's a require() result (number) or custom file (object with uri)
          if (typeof selectedSound.path === "number") {
            // This is a require() result - use it directly
            console.log("Using require() audio source:", selectedSound.path);
            audioSource = selectedSound.path;
          } else if (
            typeof selectedSound.path === "object" &&
            selectedSound.path.uri
          ) {
            // For custom files, check if file exists
            try {
              const fileInfo = await FileSystem.getInfoAsync(selectedSound.path.uri);
              console.log("File info:", fileInfo);
              if (!fileInfo.exists) {
                throw new Error(`Audio file not found at: ${selectedSound.path.uri}`);
              }
              console.log("Custom audio file verified, size:", fileInfo.size, "bytes");
              audioSource = selectedSound.path; // Keep the { uri: path } format
            } catch (fileError) {
              console.error("File check error:", fileError);
              throw new Error(`Audio file not accessible: ${fileError.message}`);
            }
          } else {
            console.error("Invalid audio path type:", typeof selectedSound.path, selectedSound.path);
            throw new Error(`Invalid audio path: ${selectedSound.path}`);
          }

          console.log("Creating audio with source:", audioSource);
          console.log("Audio source type:", typeof audioSource);
          console.log("Is custom recording:", selectedSound.isCustom);
          
          // Enhanced audio creation with better error handling
          const { sound: newSound } = await Audio.Sound.createAsync(
            audioSource,
            {
              shouldPlay: false, // Don't auto-play, we'll control it manually
              isLooping: selectedSound.isCustom ? false : true, // Don't loop custom recordings
              volume: 1.0,
              // Additional settings for better compatibility
              progressUpdateIntervalMillis: 100,
              positionMillis: 0,
              rate: 1.0,
              shouldCorrectPitch: false,
              // Enable audio session to stay active
              staysActiveInBackground: true,
            },
            (status) => {
              // Status callback for debugging
              console.log("Audio status update:", status);
              if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
                console.log("Audio finished playing");
              }
            }
          );
          console.log("Audio sound object created successfully for:", selectedSound.isCustom ? "custom recording" : "built-in sound");

          // Get initial status before playing
          const initialStatus = await newSound.getStatusAsync();
          console.log("Initial audio status:", initialStatus);

          // Ensure audio is loaded before playing
          if (!initialStatus.isLoaded) {
            console.log("Audio not loaded, waiting for load...");
            await new Promise((resolve) => {
              const checkLoaded = async () => {
                const status = await newSound.getStatusAsync();
                if (status.isLoaded) {
                  resolve();
                } else {
                  setTimeout(checkLoaded, 100);
                }
              };
              checkLoaded();
            });
          }

          // Now play the audio
          await newSound.playAsync();
          console.log("Audio play command sent successfully");
          setSound(newSound);
          
          // Enhanced status checking with multiple attempts
          let playAttempts = 0;
          const maxAttempts = 5;
          
          const checkPlaybackStatus = async () => {
            try {
              const playingStatus = await newSound.getStatusAsync();
              console.log(`Audio playback status check ${playAttempts + 1}:`, playingStatus);
              
              if (!playingStatus.isPlaying && playAttempts < maxAttempts) {
                playAttempts++;
                console.log(`Audio not playing, attempt ${playAttempts}/${maxAttempts}, retrying...`);
                
                // Try to play again
                await newSound.playAsync();
                
                // Check again after a short delay
                setTimeout(checkPlaybackStatus, 500);
              } else if (playingStatus.isPlaying) {
                console.log("Successfully playing wake-up audio:", selectedSound.name);
              } else {
                console.error("Audio failed to play after multiple attempts");
                // Fallback to alert
                Alert.alert(t("wakeUp"), selectedSound.text || t("alarmRinging"));
              }
            } catch (statusError) {
              console.error("Error checking audio status:", statusError);
            }
          };
          
          // Start checking after initial play
          setTimeout(checkPlaybackStatus, 1000);
          
        } catch (audioError) {
          console.error("Error playing audio:", audioError);
          console.error("Failed sound details:", {
            name: selectedSound.name,
            isCustom: selectedSound.isCustom,
            path: selectedSound.path,
            pathType: typeof selectedSound.path
          });
          
          // Show more specific error message for custom recordings
          if (selectedSound.isCustom) {
            Alert.alert(
              t("error"), 
              `Failed to play custom recording "${selectedSound.name}". The audio file may be corrupted or missing. Please try re-recording.`
            );
          } else {
            Alert.alert(t("wakeUp"), selectedSound.text || t("alarmRinging"));
          }
        }
      } else {
        Alert.alert(t("wakeUp"), selectedSound.text || t("alarmRinging"));
      }



      // Auto-stop alarm after 1 minute if not manually stopped
      setTimeout(() => {
        stopAlarm();
      }, 60000);
    } catch (error) {
      console.error("Error triggering alarm:", error);
      Alert.alert(t("alarmTriggered"), t("alarmRinging"));
    }
  };

  /**
   * Stops the currently playing alarm
   */
  const stopAlarm = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      setIsAlarmPlaying(false);
      setCurrentAlarmSound(null);
      setIsAlarmSet(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (error) {
      console.error("Error stopping alarm:", error);
      setIsAlarmPlaying(false);
      setCurrentAlarmSound(null);
      setSound(null);
    }
  };

  /**
   * Schedules a notification for the alarm
   * @param {Date} triggerDate - When the notification should trigger
   * @param {Object} selectedSound - The sound object for the alarm
   */
  const scheduleNotification = async (triggerDate, selectedSound) => {
    try {
      // Cancel any existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Create a critical alarm notification that bypasses Do Not Disturb
      const notificationConfig = {
        content: {
          title: t("wakeUp"),
          body: selectedSound?.text || t("alarmRinging"),
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            alarmSound: selectedSound,
            isAlarm: true,
          },
        },
        trigger: { 
          type: "date", 
          date: triggerDate,
          channelId: 'alarm-channel' // Use dedicated alarm channel
        },
      };

      // For iOS, add critical alert capability
      if (Platform.OS === 'ios') {
        notificationConfig.content.critical = true;
        notificationConfig.content.sound = 'default'; // Use string instead of object
        notificationConfig.content.interruptionLevel = 'critical'; // iOS 15+ critical interruption level
        notificationConfig.content.categoryIdentifier = 'alarm';
        // Add critical alert permissions request
        notificationConfig.content.criticalSoundVolume = 1.0;
        // Enable lock screen presentation
        notificationConfig.content.lockScreenPresentation = 'wake';
        // Enable wake screen
        notificationConfig.content.wakeScreen = true;
        // Set as critical interruption
        notificationConfig.content.interruptionLevel = 'critical';
        // Additional iOS-specific settings for better lock screen presentation
        notificationConfig.content.threadIdentifier = 'alarm-thread';
        notificationConfig.content.targetContentIdentifier = 'alarm-popup';
      }

      // Schedule the main alarm notification
      await Notifications.scheduleNotificationAsync(notificationConfig);

      // Schedule backup notifications every 15 seconds for 2 minutes
      for (let i = 1; i <= 8; i++) {
        const repeatTime = new Date(triggerDate.getTime() + (i * 15000)); // Every 15 seconds
        const backupConfig = {
          ...notificationConfig,
          content: {
            ...notificationConfig.content,
            title: t("wakeUp") + " ⏰",
            body: t("snoozeMessage", { count: i }) + " " + (selectedSound?.text || t("alarmRinging")),
            data: {
              ...notificationConfig.content.data,
              repeat: i,
            },
          },
          trigger: { 
            type: "date", 
            date: repeatTime,
            channelId: 'alarm-channel'
          },
        };
        
        await Notifications.scheduleNotificationAsync(backupConfig);
      }

      console.log("Notification scheduled for:", triggerDate);
    } catch (notificationError) {
      console.error("Failed to schedule notification:", notificationError);
    }
  };

  /**
   * Sets the alarm with the given sound
   * @param {Object} selectedSound - The sound object to use for the alarm
   * @param {Function} onAlarmTriggered - Callback function when alarm triggers
   */
  const setAlarm = async (selectedSound, onAlarmTriggered) => {
    try {
      console.log("Setting alarm for:", alarmTime, "with sound:", selectedSound?.name);

      // Store the callback for when alarm triggers
      if (onAlarmTriggered) {
        // Store the callback in a ref or state for later use
        alarmTriggerCallbackRef.current = onAlarmTriggered;
      }

      // Calculate the trigger time
      const now = new Date();
      const triggerDate = new Date(alarmTime);
      
      // If the alarm time has already passed today, set it for tomorrow
      if (triggerDate <= now) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      console.log("Alarm will trigger at:", triggerDate);

      // Set up the interval to check for alarm trigger
      // NOTE: Disabled for multi-alarm system - alarms are managed by notifications
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Interval checking is disabled - alarms are managed by the notification system
      // This prevents conflicts with the multi-alarm system in App.js

      setIsAlarmSet(true);
      setStoredAlarmSound(selectedSound);

      // Schedule notification as backup
      await scheduleNotification(triggerDate, selectedSound);

    } catch (error) {
      console.error("Error setting alarm:", error);
      throw error;
    }
  };

  /**
   * Cancels the current alarm
   */
  const cancelAlarm = async () => {
    setIsAlarmSet(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Cancel scheduled notifications
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("Scheduled notifications cancelled");
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }

    Alert.alert(t("alarmCancelled"), t("alarmCancelledMessage"));
  };

  /**
   * Handles time picker changes
   * @param {Event} event - The time picker event
   * @param {Date} selectedTime - The selected time
   */
  const onTimeChange = (event, selectedTime) => {
    console.log("onTimeChange called with:", event, selectedTime);
    
    if (selectedTime) {
      console.log("Setting alarm time to:", selectedTime);
      setAlarmTime(selectedTime);
    }
  };

  return {
    // State
    currentTime,
    alarmTime,
    isAlarmSet,
    isAlarmPlaying,
    currentAlarmSound,
    sound,
    
    // Actions
    setAlarmTime,
    triggerAlarm,
    stopAlarm,
    setAlarm,
    cancelAlarm,
    onTimeChange,
    formatTime,
  };
};

export default useAlarmLogic;
