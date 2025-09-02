import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

/**
 * TimePickerModal Component
 * 
 * Handles alarm time selection with a modal interface.
 * Provides both the trigger button and the time picker modal.
 * 
 * Props:
 * - visible: boolean - Whether the time picker modal is visible
 * - alarmTime: Date - Current alarm time
 * - isAlarmSet: boolean - Whether an alarm is currently set
 * - isAlarmPlaying: boolean - Whether alarm is currently playing
 * - onOpenPicker: function - Callback to open time picker
 * - onTimeChange: function - Callback when time is changed
 * - onSetAlarm: function - Callback to set the alarm
 * - onCancelAlarm: function - Callback to cancel current alarm
 * - onClosePicker: function - Callback to close time picker
 * 
 * Features:
 * - Set alarm time button with current time display
 * - Platform-specific time picker (spinner on iOS, default on Android)
 * - Cancel alarm button when alarm is set
 * - Modal overlay with confirm/cancel actions
 */
const TimePickerModal = ({
  visible,
  alarmTime,
  isAlarmSet,
  isAlarmPlaying,
  onOpenPicker,
  onTimeChange,
  onSetAlarm,
  onCancelAlarm,
  onClosePicker,
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
    <>
      {/* Time Setting Controls (shown when alarm is not playing) */}
      {!isAlarmPlaying && (
        <View style={styles.controlsContainer}>
          {/* Set Alarm Time Button */}
          <TouchableOpacity
            style={styles.setTimeButton}
            onPress={onOpenPicker}
            accessibilityLabel={t("setAlarmTime")}
            accessibilityRole="button"
          >
            <Text style={styles.addButtonText}>+</Text>
           
          </TouchableOpacity>

          {/* Cancel Alarm Button (shown when alarm is set) */}
          {isAlarmSet && !isAlarmPlaying && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancelAlarm}
              accessibilityLabel={t("cancelAlarm")}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>{t("cancelAlarm")}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* Time Picker Modal */}
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
      >
        <View style={styles.timePickerOverlay}>
          <View style={styles.timePickerPopup}>
            {/* Modal Title */}
            <Text style={styles.timePickerPopupTitle}>
              {t("selectAlarmTimeTitle")}
            </Text>
            
            {/* Time Picker Component */}
            <DateTimePicker
              value={alarmTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimeChange}
              textColor="#000000"
              themeVariant="light"
            />
            
            {/* Action Buttons */}
            <View style={styles.timePickerPopupButtons}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.timePickerPopupButton, styles.cancelPopupButton]}
                onPress={onClosePicker}
                accessibilityLabel={t("cancel")}
                accessibilityRole="button"
              >
                <Text style={styles.timePickerPopupButtonText}>
                  {t("cancel")}
                </Text>
              </TouchableOpacity>
              
              {/* Set Alarm Button */}
              <TouchableOpacity
                style={[styles.timePickerPopupButton, styles.setPopupButton]}
                onPress={onSetAlarm}
                accessibilityLabel={t("setAlarm")}
                accessibilityRole="button"
              >
                <Text style={styles.timePickerPopupButtonText}>
                  {t("setAlarm")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Main controls container
  controlsContainer: {
    width: "100%",
  },
  
  // Set time button styles
  setTimeButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  currentAlarmTime: {
    color: "#cccccc",
    fontSize: 14,
    marginTop: 5,
  },
  
  // Cancel button styles
  cancelButton: {
    backgroundColor: "#777777",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
  },
  
  // Modal overlay styles
  timePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 30,
    fontStyle: "bold",
    cursor: "pointer",
  },
  // Modal popup styles
  timePickerPopup: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 30,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 300,
    maxWidth: "90%",
  },
  timePickerPopupTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 25,
  },
  
  // Modal buttons styles
  timePickerPopupButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    gap: 15,
  },
  timePickerPopupButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelPopupButton: {
    backgroundColor: "#777777",
  },
  setPopupButton: {
    backgroundColor: "#555555",
  },
  timePickerPopupButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default TimePickerModal;
