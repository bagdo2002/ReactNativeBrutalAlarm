import React, { useState, useEffect, Suspense } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  AppState,
} from "react-native";
import { TEXT_STYLES } from "./components/FontSystem";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import { useTranslation } from "react-i18next";
import i18n from "./i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Component imports
import LanguageSelector from "./components/LanguageSelector";
import SplashScreenComponent from "./components/SplashScreen";
import FeaturesSplashScreen from "./components/FeaturesSplashScreen";
import { TimeDisplay } from "./components/TimeDisplay";
import { AlarmStatus } from "./components/AlarmStatus";
import SoundSelector from "./components/SoundSelector";
import RecordingModal from "./components/RecordingModal";
import CustomVoiceModal from "./components/CustomVoiceModal";
import TimePickerModal from "./components/TimePickerModal";
import AlarmPopup from "./components/AlarmPopup";
import ControlsBottomSheet from "./components/ControlsBottomSheet";
import AlarmListItem from "./components/AlarmListItem";

import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync?.().catch?.(() => {}) || Promise.resolve();

// Hook imports
import useAlarmLogic from "./hooks/useAlarmLogic";
import useAudioManager from "./hooks/useAudioManager";

// Utility imports
import {
  generateCharacterVoice,
  generateVoiceFromPreferences,
  generateAndSaveVoice,
} from "./elevenlabs";

// Configure notifications for maximum alarm reliability
// Note: Push notifications are limited in Expo Go. Use development build for full functionality.
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isAlarm = notification.request.content.data?.isAlarm;

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      // For alarm notifications, make them more persistent
      priority: isAlarm
        ? Notifications.AndroidNotificationPriority.MAX
        : Notifications.AndroidNotificationPriority.DEFAULT,
      // For iOS critical alerts and lock screen presentation
      interruptionLevel: isAlarm ? "critical" : "active",
      // Enable lock screen presentation for alarms
      lockScreenPresentation: isAlarm ? "wake" : "default",
      // Wake screen for alarms
      wakeScreen: isAlarm,
    };
  },
});

// Global variable to store the current alarm sound for background playback
let globalAlarmSound = null;

// Loading component for Suspense fallback
const AppLoading = () => (
  <SafeAreaView style={styles.container}>
    <View
      style={[
        styles.mainContent,
        { justifyContent: "center", alignItems: "center" },
      ]}
    >
      <Text style={styles.title}>Loading...</Text>
    </View>
  </SafeAreaView>
);

/**
 * Main App Component
 *
 * The root component that manages the overall app state and coordinates between
 * different sections of the alarm app. Uses custom hooks for business logic
 * and renders modular components for different features.
 *
 * Features:
 * - Splash screen and features introduction
 * - Time display and alarm status
 * - Sound selection and custom recording
 * - Multi-language support
 */

function AppContent() {
  const { t, i18n } = useTranslation();

  // Custom hooks for business logic
  const alarmLogic = useAlarmLogic();
  const audioManager = useAudioManager();

  // Handle alarm trigger when app is open
  const handleAlarmTriggered = async (alarmSound) => {
    try {
      console.log("Alarm triggered from logic:", alarmSound.name);

      setCurrentAlarmSound(alarmSound);
      setShowAlarmPopup(true);
      setIsAlarmPlaying(true);

      // Try to play audio when alarm is triggered
      if (alarmSound) {
        try {
          console.log("Attempting to play alarm audio from trigger");
          await playAlarmInBackground(alarmSound);
        } catch (audioError) {
          console.error("Error playing alarm audio from trigger:", audioError);
        }
      }
    } catch (error) {
      console.error("Error handling alarm trigger:", error);
    }
  };

  // Helper function to get default alarm sounds
  const getDefaultAlarmSounds = () => [
    {
      id: "maleadga",
      name: t("defaultAlarmSounds.maleadga.name"),
      path: require("./assets/audio/maleadga.m4a"),
      isCustom: false,
      text: t("defaultAlarmSounds.maleadga.text"),
    },
    {
      id: "trakiawi",
      name: t("defaultAlarmSounds.trakiawi.name"),
      path: require("./assets/audio/trakiawi.m4a"),
      isCustom: false,
      text: t("defaultAlarmSounds.trakiawi.text"),
    },
    {
      id: "brutal1",
      name: t("defaultAlarmSounds.brutal1.name"),
      path: null, // This sound doesn't have audio, only text
      isCustom: false,
      text: t("defaultAlarmSounds.brutal1.text"),
    },
  ];

  // UI state management
  const [selectedSoundId, setSelectedSoundId] = useState("trakiawi");
  const [availableSounds, setAvailableSounds] = useState([]);
  // Multi-alarms state
  const [alarms, setAlarms] = useState([]); // {id, time: Date, enabled: bool, soundId, repeatDays: number[]}
  const [showSoundSelector, setShowSoundSelector] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [showCustomVoiceModal, setShowCustomVoiceModal] = useState(false);
  const [recordingName, setRecordingName] = useState("");
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isSavingNavySealVoice, setIsSavingNavySealVoice] = useState(false);
  const [isPreviewingNavySealVoice, setIsPreviewingNavySealVoice] =
    useState(false);
  const [previewingSoundId, setPreviewingSoundId] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showControlsBottomSheet, setShowControlsBottomSheet] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [navySealText, setNavySealText] = useState("");
  const [showNavySealModal, setShowNavySealModal] = useState(false);
  const [selectedNavySealVoice, setSelectedNavySealVoice] =
    useState("navySeal");

  // Multiple alarms state and helpers
  const [currentAlarmId, setCurrentAlarmId] = useState(null);
  const ALARMS_STORAGE_KEY = "@brutal_alarm_alarms";

  const loadAlarmsFromStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed.map((a) => ({
        ...a,
        time: new Date(a.time),
      }));
    } catch (e) {
      console.log("loadAlarmsFromStorage error:", e);
      return [];
    }
  };

  const persistAlarms = async (next) => {
    try {
      const serializable = next.map((a) => ({
        ...a,
        time: a.time instanceof Date ? a.time.toISOString() : a.time,
      }));
      await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(serializable));
    } catch (e) {
      console.log("persistAlarms error:", e);
    }
  };

  const scheduleAlarmNotifications = async (alarm) => {
    try {
      const triggerDate = new Date(alarm.time);
      const soundObj = availableSounds.find((s) => s.id === alarm.soundId);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: t("wakeUp"),
          body: soundObj?.text || t("alarmRinging"),
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { isAlarm: true, alarmId: alarm.id, alarmSound: soundObj },
        },
        trigger: { type: "date", date: triggerDate, channelId: "alarm-channel" },
      });
      return [id];
    } catch (e) {
      console.error("scheduleAlarmNotifications error:", e);
      return [];
    }
  };

  const upsertAlarm = async (newAlarm) => {
    const idx = alarms.findIndex((a) => a.id === newAlarm.id);
    let next = [];
    if (idx >= 0) {
      next = [...alarms];
      next[idx] = { ...next[idx], ...newAlarm };
    } else {
      next = [newAlarm, ...alarms];
    }
    // schedule if enabled
    let notificationIds = newAlarm.notificationIds || [];
    if (newAlarm.enabled) {
      notificationIds = await scheduleAlarmNotifications(newAlarm);
    }
    const final = next.map((a) => (a.id === newAlarm.id ? { ...newAlarm, notificationIds } : a));
    setAlarms(final);
    await persistAlarms(final);
  };

  const toggleAlarmEnabled = async (alarmId, enabled) => {
    const target = alarms.find((a) => a.id === alarmId);
    if (!target) return;
    if (!enabled) {
      // cancel this alarm's notifications
      for (const id of target.notificationIds || []) {
        try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
      }
      const updated = alarms.map((a) => a.id === alarmId ? { ...a, enabled: false, notificationIds: [] } : a);
      setAlarms(updated);
      await persistAlarms(updated);
    } else {
      const ids = await scheduleAlarmNotifications({ ...target, enabled: true });
      const updated = alarms.map((a) => a.id === alarmId ? { ...a, enabled: true, notificationIds: ids } : a);
      setAlarms(updated);
      await persistAlarms(updated);
    }
  };

  // rescheduleAllEnabledAlarms defined later (single consolidated implementation)

  // Repeat days state
  const [repeatDays, setRepeatDays] = useState([]); // indices 0-6 for Sun-Sat
  // Repeat modal now lives inside ControlsBottomSheet
  const toggleRepeatDay = (dayIndex) => {
    setRepeatDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    );
  };

  const getRepeatSummary = () => {
    if (repeatDays.length === 0) return "Once";
    if (repeatDays.length === 7) return "Daily";

    const weekdays = [1, 2, 3, 4, 5];
    const weekend = [0, 6];
    const isWeekdays =
      weekdays.every((d) => repeatDays.includes(d)) && repeatDays.length === 5;
    if (isWeekdays) return "Weekdays";
    const isWeekend =
      weekend.every((d) => repeatDays.includes(d)) && repeatDays.length === 2;
    if (isWeekend) return "Weekend";

    // Custom selection: show day abbreviations, ordered Sun-Sat
    const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const sorted = [...repeatDays].sort((a, b) => a - b);
    return sorted.map((d) => DAY_ABBR[d]).join(", ");
  };

  // (Removed older duplicate storage helpers to avoid redeclarations)

  /**
   * Computes the next trigger Date based on the selected time and repeat days.
   * - If no repeat days selected: returns next occurrence (today or tomorrow) of the chosen time
   * - If repeat days selected: returns the closest upcoming day in that set at the chosen time
   */
  const computeNextTriggerDate = () => {
    const now = new Date();
    const base = new Date(alarmLogic.alarmTime);
    // Normalize seconds/millis
    const targetHour = base.getHours();
    const targetMinute = base.getMinutes();

    // No repeats -> once
    if (repeatDays.length === 0) {
      const candidate = new Date(now);
      candidate.setHours(targetHour, targetMinute, 0, 0);
      if (candidate <= now) {
        candidate.setDate(candidate.getDate() + 1);
      }
      return candidate;
    }

    // Find the soonest selected weekday in the future (including today if time not passed)
    for (let i = 0; i <= 7; i++) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + i);
      candidate.setHours(targetHour, targetMinute, 0, 0);
      const dayIndex = candidate.getDay(); // 0 (Sun) - 6 (Sat)
      if (repeatDays.includes(dayIndex) && candidate > now) {
        return candidate;
      }
    }

    // Fallback: one day ahead
    const fallback = new Date(now);
    fallback.setDate(now.getDate() + 1);
    fallback.setHours(targetHour, targetMinute, 0, 0);
    return fallback;
  };

  // Alarm popup state
  const [showAlarmPopup, setShowAlarmPopup] = useState(false);
  const [currentAlarmSound, setCurrentAlarmSound] = useState(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  // App lifecycle state
  const [showFeaturesSplash, setShowFeaturesSplash] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);

  SplashScreen.hideAsync();

  /**
   * Setup background audio for when app goes to background
   */
  const setupBackgroundAudio = async () => {
    try {
      console.log("Setting up background audio");
      await audioManager.setupBackgroundAlarmAudio();
    } catch (error) {
      console.error("Error setting up background audio:", error);
    }
  };

  /**
   * Handle app state changes for background alarm functionality
   */

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      console.log("App state changed from", appState, "to", nextAppState);

      if (appState.match(/inactive|background/) && nextAppState === "active") {
        console.log("App has come to the foreground");
        // Re-setup audio when app comes back to foreground
        audioManager.setupAudio();
      } else if (nextAppState.match(/inactive|background/)) {
        console.log("App has gone to the background");
        // Ensure background audio is configured when app goes to background
        setupBackgroundAudio();
      }

      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [appState]);

  /**
   * Get the currently selected sound object
   */
  const selectedSound = availableSounds.find((s) => s.id === selectedSoundId);



  /**
   * Schedules daily motivational reminders at 2PM
   */
  const scheduleMotivationalReminders = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const motivationalMessages = [
        "Time to crush your goals! 💪",
        "No excuses today - make it happen! 🔥",
        "Your future self will thank you! ⭐",
        "Push through - you've got this! 🚀",
        "Excellence is a habit, not an act! 🏆",
      ];

      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(14, 0, 0, 0); // 2:00 PM

      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💪 Daily Motivation",
          body: motivationalMessages[
            Math.floor(Math.random() * motivationalMessages.length)
          ],
          sound: true,
        },
        trigger: {
          type: "date",
          date: reminderTime,
          repeats: true,
        },
      });

      console.log("Daily motivational reminders scheduled for 2PM");
    } catch (error) {
      console.error("Error scheduling motivational reminders:", error);
    }
  };

  // Schedule one alarm (cancel existing same-id notifications not tracked here; using full cancel for now)
  const scheduleOneAlarm = async (alarm) => {
    try {
      const soundObj = availableSounds.find((s) => s.id === alarm.soundId) || selectedSound;

      // Compute next trigger from its time and repeatDays
      const now = new Date();
      const base = new Date(alarm.time);
      const targetHour = base.getHours();
      const targetMinute = base.getMinutes();

      let triggerDate = null;
      const r = alarm.repeatDays || [];
      if (!r.length) {
        const candidate = new Date(now);
        candidate.setHours(targetHour, targetMinute, 0, 0);
        if (candidate <= now) candidate.setDate(candidate.getDate() + 1);
        triggerDate = candidate;
      } else {
        for (let i = 0; i <= 7; i++) {
          const candidate = new Date(now);
          candidate.setDate(now.getDate() + i);
          candidate.setHours(targetHour, targetMinute, 0, 0);
          if (r.includes(candidate.getDay()) && candidate > now) {
            triggerDate = candidate;
            break;
          }
        }
        if (!triggerDate) {
          triggerDate = new Date(now);
          triggerDate.setDate(now.getDate() + 1);
          triggerDate.setHours(targetHour, targetMinute, 0, 0);
        }
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: t("wakeUp"),
          body: soundObj?.text || t("alarmRinging"),
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { alarmSound: soundObj, isAlarm: true, alarmId: alarm.id },
        },
        trigger: { type: "date", date: triggerDate, channelId: "alarm-channel" },
      });
    } catch (e) {
      console.log("Failed to schedule alarm", alarm?.id, e);
    }
  };

  const rescheduleAllEnabledAlarms = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      const enabled = alarms.filter((a) => a.enabled);
      for (const a of enabled) {
        await scheduleOneAlarm(a);
      }
    } catch (e) {
      console.log("Failed to reschedule alarms:", e);
    }
  };

  /**
   * Handlers for recording functionality
   */
  const handleRecordingComplete = async () => {
    const uri = await audioManager.stopRecording();
    if (uri) {
      setShowRecordingModal(false);
      setShowNamingModal(true);
    }
  };

  const handleSaveRecording = async () => {
    const newSound = await audioManager.saveRecordingWithName(
      recordingName,
      availableSounds
    );
    if (newSound) {
      const updatedSounds = [...availableSounds, newSound];
      setAvailableSounds(updatedSounds);
      setSelectedSoundId(newSound.id);
      setShowNamingModal(false);
      setRecordingName("");
    }
  };

  const handleDeleteCustomSound = async (soundId) => {
    const updatedSounds = await audioManager.deleteCustomSound(
      soundId,
      availableSounds
    );
    setAvailableSounds(updatedSounds);
    if (selectedSoundId === soundId) {
      setSelectedSoundId("trakiawi");
    }
  };

  const handlePreviewSound = async (soundObject) => {
    try {
      // Set the sound as currently previewing
      setPreviewingSoundId(soundObject.id);

      await audioManager.previewCustomSound(soundObject);

      // Auto-clear the previewing state after 10 seconds (matching the auto-stop in useAudioManager)
      setTimeout(() => {
        setPreviewingSoundId(null);
      }, 1000);
    } catch (error) {
      // Clear previewing state on error
      setPreviewingSoundId(null);
      console.error("Error previewing sound:", error);
    }
  };

  /**
   * Handlers for custom voice functionality
   */
  const handleGenerateCustomVoice = async (text, voiceId, name) => {
    try {
      setIsGeneratingVoice(true);

      const newVoiceSound = await generateAndSaveVoice(text, voiceId, name);

      if (newVoiceSound) {
        const savedSound = await audioManager.saveTTSAsCustomVoice(
          newVoiceSound,
          availableSounds
        );
        if (savedSound) {
          const updatedSounds = [...availableSounds, savedSound];
          setAvailableSounds(updatedSounds);
          setSelectedSoundId(savedSound.id);
          setShowCustomVoiceModal(false);
        }
      }
    } catch (error) {
      console.error("Failed to generate custom voice:", error);
      Alert.alert(t("error"), error.message || t("failedToGenerateVoice"));
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  /**
   * Handlers for alarm functionality
   */
  /**
   * Handle setting the alarm
   */
  const handleSetAlarm = async () => {
    try {
      const hasPermissions = await requestNotificationPermissions();
      if (!hasPermissions) return;

      // Determine next trigger date based on selected repeat days
      const nextTrigger = computeNextTriggerDate();
      alarmLogic.setAlarmTime(nextTrigger);

      // Set the alarm with the callback for when it triggers
      await alarmLogic.setAlarm(selectedSound, handleAlarmTriggered);
      setShowTimePicker(false);
    } catch (error) {
      console.error("Error setting alarm:", error);
      Alert.alert(t("error"), "Failed to set alarm. Please try again.");
    }
  };

  /**
   * Test alarm function - sets an alarm for 30 seconds from now
   */
  const handleTestAlarm = () => {
    const testTime = new Date();
    testTime.setSeconds(testTime.getSeconds() + 30); // 30 seconds from now
    alarmLogic.setAlarmTime(testTime);

    setTimeout(() => {
      handleSetAlarm();
      Alert.alert(
        "Test Alarm Set! 🚨",
        "Test alarm will ring in 30 seconds. Close the app and lock your phone to test background functionality!",
        [{ text: "OK" }]
      );
    }, 100);
  };

  const handleTimePickerChange = (event, selectedTime) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    alarmLogic.onTimeChange(event, selectedTime);
  };

  /**
   * Splash screen handlers
   */
  const handleSplashFinish = () => {
    setShowSplashScreen(false);
    setShowFeaturesSplash(true);
  };

  const handleFeaturesSplashNext = () => {
    setShowFeaturesSplash(false);
    setIsAppReady(true);
  };

  /**
   * Set up notification listeners for background alarm handling
   */
  useEffect(() => {
    // Handle app state changes to ensure audio continues in background
    const handleAppStateChange = (nextAppState) => {
      console.log("App state changed to:", nextAppState);

      if (nextAppState === "background" && alarmLogic.isAlarmPlaying) {
        console.log(
          "App going to background while alarm is playing - ensuring audio continues"
        );
        // Ensure audio mode is set for background playback
        Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          shouldCorrectPitch: false,
        }).catch((error) => {
          console.error("Error setting audio mode for background:", error);
        });
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Handle notification responses (when user taps notification)
    const notificationListener = Notifications.addNotificationReceivedListener(
      async (notification) => {
        console.log("Notification received:", notification);

        // Check if this is an alarm notification
        const isAlarm = notification.request.content.data?.isAlarm;

        if (isAlarm) {
          console.log("Alarm notification received, showing popup");

          // Get the alarm sound data
          const alarmSoundData =
            notification.request.content.data?.alarmSound || selectedSound;
          const notifiedAlarmId = notification.request.content.data?.alarmId || null;
          if (notifiedAlarmId) setCurrentAlarmId(notifiedAlarmId);

          // Show the alarm popup
          setCurrentAlarmSound(alarmSoundData);
          setShowAlarmPopup(true);
          setIsAlarmPlaying(true);

          // Try to play audio for both platforms when notification is received
          if (alarmSoundData) {
            try {
              console.log("Attempting to play alarm audio from notification");
              await playAlarmInBackground(alarmSoundData);
            } catch (audioError) {
              console.error(
                "Error playing alarm audio from notification:",
                audioError
              );
            }
          }
        }
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received:", response);

        // Handle alarm notification responses
        const isAlarm = response.notification.request.content.data?.isAlarm;
        const actionIdentifier = response.actionIdentifier;

        if (isAlarm) {
          console.log("Alarm notification response:", actionIdentifier);

          if (actionIdentifier === "snooze") {
            handleAlarmSnooze();
          } else if (actionIdentifier === "stop") {
            handleAlarmStop();
          } else {
            // Default action - show alarm popup
            const alarmSoundData =
              response.notification.request.content.data?.alarmSound ||
              selectedSound;
            const notifiedAlarmId = response.notification.request.content.data?.alarmId || null;
            if (notifiedAlarmId) setCurrentAlarmId(notifiedAlarmId);
            setCurrentAlarmSound(alarmSoundData);
            setShowAlarmPopup(true);
            setIsAlarmPlaying(true);

            // Try to play audio when user taps notification
            if (alarmSoundData) {
              try {
                console.log(
                  "Attempting to play alarm audio from notification tap"
                );
                playAlarmInBackground(alarmSoundData);
              } catch (audioError) {
                console.error(
                  "Error playing alarm audio from notification tap:",
                  audioError
                );
              }
            }
          }
        }
      });

    return () => {
      subscription?.remove();
      notificationListener?.remove?.();
      responseListener?.remove?.();
    };
  }, [selectedSound, t, alarmLogic.isAlarmPlaying]);

  /**
   * Play alarm sound in background when notification is received
   */
  const playAlarmInBackground = async (soundObject) => {
    try {
      console.log("Playing alarm in background:", soundObject.name);

      // Stop any existing alarm sound
      if (globalAlarmSound) {
        try {
          const status = await globalAlarmSound.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              await globalAlarmSound.stopAsync();
            }
            await globalAlarmSound.unloadAsync();
          }
        } catch (e) {
          console.log("Error stopping previous alarm:", e);
        }
        globalAlarmSound = null;
      }

      // Configure audio for background playback using our audio manager
      await audioManager.setupBackgroundAlarmAudio();

      // Enhanced audio creation with better error handling
      const { sound: newSound } = await Audio.Sound.createAsync(
        soundObject.path,
        {
          shouldPlay: false, // Don't auto-play, we'll control it manually
          isLooping: !soundObject.isCustom, // Loop built-in sounds, not custom recordings
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
          console.log("Background audio status update:", status);
          if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
            console.log("Background audio finished playing");
          }
        }
      );

      globalAlarmSound = newSound;
      console.log("Background alarm sound created");

      // Ensure audio is loaded before playing
      const initialStatus = await newSound.getStatusAsync();
      console.log("Initial background audio status:", initialStatus);

      if (!initialStatus.isLoaded) {
        console.log("Background audio not loaded, waiting for load...");
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
      console.log("Background alarm sound started");

      // Enhanced status checking with multiple attempts
      let playAttempts = 0;
      const maxAttempts = 5;

      const checkBackgroundPlaybackStatus = async () => {
        try {
          const playingStatus = await newSound.getStatusAsync();
          console.log(
            `Background audio playback status check ${playAttempts + 1}:`,
            playingStatus
          );

          if (!playingStatus.isPlaying && playAttempts < maxAttempts) {
            playAttempts++;
            console.log(
              `Background audio not playing, attempt ${playAttempts}/${maxAttempts}, retrying...`
            );

            // Try to play again
            await newSound.playAsync();

            // Check again after a short delay
            setTimeout(checkBackgroundPlaybackStatus, 500);
          } else if (playingStatus.isPlaying) {
            console.log(
              "Successfully playing background alarm audio:",
              soundObject.name
            );
          } else {
            console.error(
              "Background audio failed to play after multiple attempts"
            );
          }
        } catch (statusError) {
          console.error("Error checking background audio status:", statusError);
        }
      };

      // Start checking after initial play
      setTimeout(checkBackgroundPlaybackStatus, 1000);

      // Auto-stop after 1 minute
      setTimeout(async () => {
        try {
          if (globalAlarmSound) {
            await globalAlarmSound.stopAsync();
            await globalAlarmSound.unloadAsync();
            globalAlarmSound = null;
            console.log("Background alarm auto-stopped after 1 minute");
          }
        } catch (e) {
          console.error("Error auto-stopping background alarm:", e);
        }
      }, 60000);
    } catch (error) {
      console.error("Error playing alarm in background:", error);
    }
  };

  /**
   * Request notification permissions
   */
  const requestNotificationPermissions = async () => {
    try {
      // Set up notification categories for iOS
      if (Platform.OS === "ios") {
        await Notifications.setNotificationCategoryAsync("alarm", [
          {
            identifier: "snooze",
            buttonTitle: "Snooze",
            options: {
              isDestructive: false,
              isAuthenticationRequired: false,
            },
          },
          {
            identifier: "stop",
            buttonTitle: "Stop Alarm",
            options: {
              isDestructive: true,
              isAuthenticationRequired: false,
            },
          },
        ]);
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
            allowCriticalAlerts: true, // Request critical alert permissions
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          t("permissionRequired"),
          "Notification permissions are required for alarms to work when the phone is locked. Please enable notifications and critical alerts in Settings."
        );
        return false;
      }

      console.log("Notification permissions granted");
      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  };

  /**
   * Handle alarm popup stop action
   */
  const handleAlarmStop = async () => {
    try {
      console.log("Handling alarm stop");

      // Stop current alarm
      if (globalAlarmSound) {
        try {
          const status = await globalAlarmSound.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              await globalAlarmSound.stopAsync();
            }
            await globalAlarmSound.unloadAsync();
          }
        } catch (error) {
          console.error("Error stopping global alarm sound:", error);
        }
        globalAlarmSound = null;
      }

      // Stop alarm logic
      alarmLogic.stopAlarm();

      // Reset UI state
      setShowAlarmPopup(false);
      setCurrentAlarmSound(null);
      setIsAlarmPlaying(false);

      // Cancel scheduled notifications for current alarm only, and handle repeat
      if (currentAlarmId) {
        const target = alarms.find((a) => a.id === currentAlarmId);
        if (target) {
          for (const id of target.notificationIds || []) {
            try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
          }
          // If repeating, compute next occurrence and reschedule
          if (target.repeatDays && target.repeatDays.length > 0) {
            const now = new Date();
            const base = new Date(target.time);
            const targetHour = base.getHours();
            const targetMinute = base.getMinutes();
            let nextDate = null;
            for (let i = 0; i <= 7; i++) {
              const candidate = new Date(now);
              candidate.setDate(now.getDate() + i);
              candidate.setHours(targetHour, targetMinute, 0, 0);
              if (target.repeatDays.includes(candidate.getDay()) && candidate > now) {
                nextDate = candidate; break;
              }
            }
            if (!nextDate) {
              nextDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
              nextDate.setHours(targetHour, targetMinute, 0, 0);
            }
            const ids = await scheduleAlarmNotifications({ ...target, time: nextDate });
            const updated = alarms.map((a) => a.id === target.id ? { ...a, time: nextDate, enabled: true, notificationIds: ids } : a);
            setAlarms(updated);
            await persistAlarms(updated);
          } else {
            const updated = alarms.map((a) => a.id === target.id ? { ...a, enabled: false, notificationIds: [] } : a);
            setAlarms(updated);
            await persistAlarms(updated);
          }
        }
        setCurrentAlarmId(null);
      }

      console.log("Alarm stopped successfully");
    } catch (error) {
      console.error("Error handling alarm stop:", error);
    }
  };

  /**
   * Handle alarm popup snooze action
   */
  const handleAlarmSnooze = async () => {
    try {
      console.log("Handling alarm snooze");

      // Stop current alarm
      if (globalAlarmSound) {
        try {
          const status = await globalAlarmSound.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              await globalAlarmSound.stopAsync();
            }
            await globalAlarmSound.unloadAsync();
          }
        } catch (error) {
          console.error("Error stopping global alarm sound:", error);
        }
        globalAlarmSound = null;
      }

      // Stop alarm logic
      alarmLogic.stopAlarm();

      // Reset UI state
      setShowAlarmPopup(false);
      setCurrentAlarmSound(null);
      setIsAlarmPlaying(false);

      // Set snooze alarm for 5 minutes later
      const snoozeTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      console.log("Setting snooze alarm for:", snoozeTime);

      // Schedule snooze notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t("snoozeAlarm"),
          body: t("snoozeMessage", { count: 1 }),
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            alarmSound: currentAlarmSound || selectedSound,
            isAlarm: true,
            isSnooze: true,
          },
        },
        trigger: {
          type: "date",
          date: snoozeTime,
          channelId: "alarm-channel",
        },
      });

      Alert.alert(t("alarmSnoozed"), t("alarmSnoozedMessage"));
    } catch (error) {
      console.error("Error handling alarm snooze:", error);
    }
  };

  /**
   * Handle alarm popup close action
   */
  const handleAlarmClose = async () => {
    try {
      // Stop current alarm
      if (globalAlarmSound) {
        try {
          const status = await globalAlarmSound.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              await globalAlarmSound.stopAsync();
            }
            await globalAlarmSound.unloadAsync();
          }
        } catch (error) {
          console.error("Error stopping global alarm sound:", error);
        }
        globalAlarmSound = null;
      }

      // Stop alarm logic
      alarmLogic.stopAlarm();

      // Reset UI state
      setShowAlarmPopup(false);
      setCurrentAlarmSound(null);
      setIsAlarmPlaying(false);
    } catch (error) {
      console.error("Error handling alarm close:", error);
    }
  };

  /**
   * Set up dedicated alarm notification channel for Android
   */
  const setupAlarmNotificationChannel = async () => {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("alarm-channel", {
          name: "Alarm Notifications",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: true, // Bypass Do Not Disturb
        });
        console.log("Alarm notification channel created");
      }
    } catch (error) {
      console.error("Error setting up alarm notification channel:", error);
    }
  };

  /**
   * App initialization effect
   * Sets up audio, checks onboarding status, and loads custom sounds
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Keep the native splash screen visible while loading
        await SplashScreen.preventAutoHideAsync();

        // Setup audio using our hook
        await audioManager.setupAudio();
        await audioManager.requestAudioPermissions();

        // Request notification permissions for background alarms
        await requestNotificationPermissions();

        // Set up alarm notification channel for Android
        await setupAlarmNotificationChannel();

        // Features splash will be shown first after main splash
        console.log(
          "App initialization complete - will show features splash after main splash"
        );



        // Load custom sounds using our hook
        let customSounds = [];
        try {
          customSounds = await audioManager.loadCustomSoundsFromStorage();
        } catch (e) {
          console.log("Error loading custom sounds:", e);
        }

        const defaultSounds = getDefaultAlarmSounds();
        setAvailableSounds([...defaultSounds, ...customSounds]);

        // Load saved alarms
        const savedAlarms = await loadAlarmsFromStorage();
        setAlarms(savedAlarms);

        // App is ready - hide native splash screen and show custom one
        setIsAppReady(true);
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("Error during app initialization:", error);
        setIsAppReady(true);
        setShowSplashScreen(false);
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, []);

  /**
   * Update default sounds when language changes
   */
  useEffect(() => {
    const updateDefaultSounds = async () => {
      const customSounds = await audioManager.loadCustomSoundsFromStorage();
      const defaultSounds = getDefaultAlarmSounds();
      setAvailableSounds([...defaultSounds, ...customSounds]);
    };

    updateDefaultSounds();
  }, [i18n.language, t]);

  /**
   * App rendering logic
   */

  // Show splash screen first
  if (!isAppReady || showSplashScreen) {
    return <SplashScreenComponent onAnimationFinish={handleSplashFinish} />;
  }

  // Show features splash screen
  if (showFeaturesSplash) {
    return <FeaturesSplashScreen onNext={handleFeaturesSplashNext} />;
  }



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
    
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLanguageSelector(true)}
          >
            <Text style={styles.languageButtonText}>🌐</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.title}>{t("appTitle")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingAlarm(null);
              // reset selectors to defaults when adding new
              setSelectedSoundId("trakiawi");
              setRepeatDays([]);
              setShowControlsBottomSheet(true);
            }}
          >
            <Text style={styles.createalarmbuttontext}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.mainContent}>
          {/* Alarm Status
          <AlarmStatus
            isAlarmSet={alarmLogic.isAlarmSet}
            isAlarmPlaying={alarmLogic.isAlarmPlaying}
            alarmTime={alarmLogic.alarmTime}
            currentAlarmSound={alarmLogic.currentAlarmSound}
            selectedSound={selectedSound}
            onStopAlarm={alarmLogic.stopAlarm}
          /> */}

          {alarms.map((a) => (
            <AlarmListItem
              key={a.id}
              time={a.time}
              isEnabled={!!a.enabled}
              repeatDays={a.repeatDays || []}
              onToggle={async (newVal) => {
                await toggleAlarmEnabled(a.id, newVal);
                await rescheduleAllEnabledAlarms();
              }}
              soundName={
                (availableSounds.find((s) => s.id === a.soundId) || selectedSound)?.name
              }
              onPress={() => {
                setEditingAlarm(a);
                // Prefill controls
                alarmLogic.setAlarmTime(new Date(a.time));
                setSelectedSoundId(a.soundId);
                setRepeatDays(a.repeatDays || []);
                setShowControlsBottomSheet(true);
              }}
            />
          ))}

        </View>
      </ScrollView>

      {/* Controls Bottom Sheet */}
      <ControlsBottomSheet
        visible={showControlsBottomSheet}
        onClose={() => setShowControlsBottomSheet(false)}
        onSave={async () => {
          const alarmToSave = {
            id: editingAlarm ? editingAlarm.id : String(Date.now()),
            time: new Date(alarmLogic.alarmTime),
            enabled: editingAlarm ? editingAlarm.enabled : true,
            soundId: selectedSoundId,
            repeatDays: [...repeatDays],
          };
          await upsertAlarm(alarmToSave);
          setShowControlsBottomSheet(false);
          setEditingAlarm(null);
          await rescheduleAllEnabledAlarms();
        }}
        onDelete={editingAlarm ? async () => {
          // cancel notifications for this alarm
          for (const id of editingAlarm.notificationIds || []) {
            try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
          }
          const next = alarms.filter((x) => x.id !== editingAlarm.id);
          setAlarms(next);
          await persistAlarms(next);
          setShowControlsBottomSheet(false);
          setEditingAlarm(null);
        } : undefined}
        // Time picker props
        showTimePicker={showTimePicker}
        alarmTime={alarmLogic.alarmTime}
        isAlarmSet={alarmLogic.isAlarmSet}
        isAlarmPlaying={alarmLogic.isAlarmPlaying}
        onOpenTimePicker={() => setShowTimePicker(true)}
        onTimeChange={handleTimePickerChange}
        onSetAlarm={handleSetAlarm}
        onCancelAlarm={alarmLogic.cancelAlarm}
        onCloseTimePicker={() => setShowTimePicker(false)}
        // Sound selector props
        showSoundSelector={showSoundSelector}
        selectedSound={selectedSound}
        availableSounds={availableSounds}
        selectedSoundId={selectedSoundId}
        onCloseSoundSelector={() => setShowSoundSelector(false)}
        onSelectSound={setSelectedSoundId}
        onDeleteCustomSound={handleDeleteCustomSound}
        onOpenSoundSelector={() => setShowSoundSelector(true)}
        onPreviewSound={handlePreviewSound}
        previewingSoundId={previewingSoundId}
        // Repeat props
        repeatSummary={getRepeatSummary()}
        repeatDays={repeatDays}
        onToggleRepeatDay={toggleRepeatDay}
        // Recording modal props
        showRecordingModal={showRecordingModal}
        showNamingModal={showNamingModal}
        isRecording={audioManager.isRecording}
        recordingName={recordingName}
        recordingUri={audioManager.tempRecordingUri}
        onOpenRecordingModal={() => setShowRecordingModal(true)}
        onCloseRecordingModal={() => setShowRecordingModal(false)}
        onStartRecording={audioManager.startRecording}
        onStopRecording={handleRecordingComplete}
        onCancelRecording={async () => {
          await audioManager.cancelRecording();
          setShowRecordingModal(false);
        }}
        onRecordingNameChange={setRecordingName}
        onSaveRecording={handleSaveRecording}
        onCancelNaming={() => {
          setShowNamingModal(false);
          setRecordingName("");
        }}
        onOpenCustomVoiceModal={() => setShowCustomVoiceModal(true)}
        // Custom voice modal props
        showCustomVoiceModal={showCustomVoiceModal}
        onCloseCustomVoiceModal={() => setShowCustomVoiceModal(false)}
        onGenerateVoice={handleGenerateCustomVoice}
        isGenerating={isGeneratingVoice}
      />

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />

      {/* Alarm Popup Modal */}
      <AlarmPopup
        isVisible={showAlarmPopup}
        alarmSound={currentAlarmSound}
        onStop={handleAlarmStop}
        onSnooze={handleAlarmSnooze}
        onClose={handleAlarmClose}
      />

      
    </SafeAreaView>
  );
}

// Main App component with Suspense wrapper
export default function App() {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    // Ensure i18n is ready before rendering
    const checkI18nReady = () => {
      if (i18n.isInitialized) {
        setIsI18nReady(true);
      } else {
        setTimeout(checkI18nReady, 100);
      }
    };
    checkI18nReady();
  }, []);

  if (!isI18nReady) {
    return <AppLoading />;
  }

  return (
    <Suspense fallback={<AppLoading />}>
      <AppContent />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  fixedHeader: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    zIndex: 1000,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    padding: 0,
    minHeight: "100%",
    justifyContent: "flex-start",
  },
  header: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  title: {
    ...TEXT_STYLES.splashTitle,
    color: "#000000",
    textAlign: "center",
  },
  languageButton: {
    position: "absolute",
    left: 5,
    padding: 8,
    borderRadius: 20,
  },
  addButton: {
    position: "absolute",
    right: 5,
    padding: 8,
    borderRadius: 20,
    cursor: "pointer",
  },
 
  languageButtonText: {
    ...TEXT_STYLES.buttonTextLarge,
    fontSize:'25'
  }, 
  createalarmbuttontext: {
    ...TEXT_STYLES.buttonTextLarge,
    fontSize:'35'
  },
  controlsContainer: {
    width: "100%",
  },
  openControlsButton: {
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  openControlsButtonText: {
    ...TEXT_STYLES.buttonTextLarge,
    color: "#000000",
  },
});
