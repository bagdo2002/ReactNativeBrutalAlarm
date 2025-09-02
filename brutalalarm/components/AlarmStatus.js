import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TEXT_STYLES } from './FontSystem';

/**
 * AlarmStatus Component
 * 
 * Displays the current alarm status and provides controls when alarm is active.
 * Shows different UI states based on whether alarm is set, playing, or inactive.
 * 
 * Props:
 * - isAlarmSet: boolean - Whether an alarm is currently set
 * - isAlarmPlaying: boolean - Whether the alarm is currently playing
 * - alarmTime: Date - The time the alarm is set for
 * - currentAlarmSound: object - The sound object for the currently playing alarm
 * - selectedSound: object - The currently selected alarm sound
 * - onStopAlarm: function - Callback to stop the alarm
 * 
 * States:
 * 1. No alarm set - Shows nothing
 * 2. Alarm set - Shows alarm time and sound info
 * 3. Alarm playing - Shows wake up message and stop button
 */
const AlarmStatus = ({
  isAlarmSet,
  isAlarmPlaying,
  alarmTime,
  currentAlarmSound,
  selectedSound,
  onStopAlarm,
}) => {
  const { t } = useTranslation();

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

  return (
    <View style={styles.alarmContainer}>
      {/* Alarm Set State - Shows when alarm is set but not playing */}
      {isAlarmSet && !isAlarmPlaying && (
        <View style={styles.alarmSetContainer}>
          <Text style={styles.alarmSetText}>{t("alarmSetFor")}</Text>
          <Text style={styles.alarmTime}>{formatTime(alarmTime)}</Text>
          <Text style={styles.alarmSoundText}>
            {t("sound")} {selectedSound?.name}
          </Text>
        </View>
      )}

      {/* Alarm Playing State - Shows when alarm is actively ringing */}
      {isAlarmPlaying && currentAlarmSound && (
        <View style={styles.alarmPlayingContainer}>
          {/* Wake up title */}
          <Text style={styles.alarmPlayingTitle}>{t("wakeUp")}</Text>
          
          {/* Alarm message text */}
          <Text style={styles.alarmMessage}>
            {currentAlarmSound.text || t("alarmRinging")}
          </Text>
          
          {/* Stop alarm button */}
          <TouchableOpacity 
            style={styles.stopButton} 
            onPress={onStopAlarm}
            accessibilityLabel={t("stopAlarm")}
            accessibilityRole="button"
          >
            <Text style={styles.stopButtonText}>{t("stopAlarm")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  alarmContainer: {
    alignItems: "center",
    marginBottom: 15,
    minHeight: 60,
  },
  // Styles for when alarm is set but not playing
  alarmSetContainer: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#666666",
    width: "100%",
  },
  alarmSetText: {
    ...TEXT_STYLES.sectionTitle,
    color: "#444444",
    marginBottom: 8,
  },
  alarmTime: {
    ...TEXT_STYLES.alarmTime,
    color: "#222222",
    marginBottom: 5,
  },
  alarmSoundText: {
    ...TEXT_STYLES.caption,
    color: "#666666",
    fontStyle: "italic",
  },
  // Styles for when alarm is actively playing
  alarmPlayingContainer: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#000000",
    borderRadius: 20,
    width: "100%",
  },
  alarmPlayingTitle: {
    ...TEXT_STYLES.alarmTitle,
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
  },
  alarmMessage: {
    ...TEXT_STYLES.alarmMessage,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 25,
  },
  stopButton: {
    backgroundColor: "#444444",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  stopButtonText: {
    ...TEXT_STYLES.buttonTextLarge,
    color: "#ffffff",
  },
});

export { AlarmStatus };
