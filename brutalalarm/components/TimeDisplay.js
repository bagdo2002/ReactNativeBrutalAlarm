import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TEXT_STYLES } from './FontSystem';

/**
 * TimeDisplay Component
 * 
 * Displays the current time and date in a formatted card layout.
 * Updates in real-time to show current time.
 * 
 * Props:
 * - currentTime: Date object representing the current time
 * 
 * Features:
 * - Shows time in 12-hour format with AM/PM
 * - Displays localized date based on current language
 * - Responsive design with shadow effects
 */
const TimeDisplay = ({ currentTime }) => {
  const { i18n } = useTranslation();

  /**
   * Formats time to 12-hour format with AM/PM
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
   * Gets the appropriate locale for date formatting based on current language
   * @returns {string} Locale string for date formatting
   */
  const getDateLocale = () => {
    switch (i18n.language) {
      case "ka":
        return "ka-GE";
      case "ru":
        return "ru-RU";
      default:
        return "en-US";
    }
  };

  return (
    <View style={styles.timeContainer}>
      {/* Current Time Display */}
      <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
      
      {/* Current Date Display */}
      <Text style={styles.currentDate}>
        {currentTime.toLocaleDateString(getDateLocale(), {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timeContainer: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  currentTime: {
    ...TEXT_STYLES.timeDisplay,
    color: "#1a1a1a",
    marginBottom: 5,
  },
  currentDate: {
    ...TEXT_STYLES.dateDisplay,
    color: "#8e8e93",
    textAlign: "center",
  },
});

export { TimeDisplay };
