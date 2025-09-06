import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  TextInput,
} from "react-native";
import { useTranslation } from "react-i18next";
import { TEXT_STYLES } from "./FontSystem";
import DateTimePicker from "@react-native-community/datetimepicker";

// Import the control components
import SoundSelector from "./SoundSelector";
import RecordingModal from "./RecordingModal";
import CustomVoiceModal from "./CustomVoiceModal";
import RepeatDaysModal from "./RepeatDaysModal";

const { height: screenHeight } = Dimensions.get("window");

const ControlsBottomSheet = ({
  visible,
  onClose,
  onSave,
  onDelete,
  onTestAlarm,

  alarmTime,

  onTimeChange,

  showSoundSelector,
  selectedSound,
  availableSounds,
  selectedSoundId,
  onCloseSoundSelector,
  onSelectSound,
  onDeleteCustomSound,
  onOpenSoundSelector,
  onPreviewSound,
  previewingSoundId,
  repeatSummary,
  repeatDays,
  onToggleRepeatDay,
  alarmLabel,
  onLabelChange,
  onRemoveLabel,
  showRecordingModal,
  showNamingModal,
  isRecording,
  recordingName,
  recordingUri,
  onOpenRecordingModal,
  onCloseRecordingModal,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onRecordingNameChange,
  onSaveRecording,
  onCancelNaming,
  onOpenCustomVoiceModal,
  showCustomVoiceModal,
  onCloseCustomVoiceModal,
  onGenerateVoice,
  isGeneratingVoice,
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
  const [showRepeatModal, setShowRepeatModal] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header with drag indicator */}
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              accessibilityLabel={t("cancel")}
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={onTestAlarm}
              accessibilityLabel="Test Alarm"
              accessibilityRole="button"
            >
              <Text style={styles.testButtonText}>🚨 Test</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSave || onClose}
              accessibilityLabel={t("save")}
              accessibilityRole="button"
            >
              <Text style={styles.saveButtonText}>{t("save")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Time Picker Section - Always Visible */}
          <View style={styles.section}>
            {/* Time Picker Component */}
            <View style={styles.timePickerContainer}>
              <DateTimePicker
                value={alarmTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onTimeChange}
                textColor="#000000"
                themeVariant="light"
              />
            </View>
            {/* Repeat Days Modal */}
            <RepeatDaysModal
              visible={showRepeatModal}
              selectedDays={repeatDays}
              onToggleDay={onToggleRepeatDay}
              onClose={() => setShowRepeatModal(false)}
            />
          </View>

          {/* Label Section */}
          <View style={styles.section}>
            <View style={styles.controlButton}>
              <View style={styles.controlButtonTextContainer}>
                <Text style={styles.controlButtonSubtitle}>Label</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  style={styles.labelInputInline}
                  placeholder="Label"
                  value={alarmLabel || ""}
                  onChangeText={onLabelChange}
                  maxLength={50}
                  accessibilityLabel={t("alarmLabel") || "Alarm label"}
                />
                {alarmLabel && alarmLabel.trim() && (
                  <TouchableOpacity
                    style={styles.removeLabelButton}
                    onPress={onRemoveLabel}
                    accessibilityLabel={t("removeLabel") || "Remove label"}
                    accessibilityRole="button"
                  >
                    <Text style={styles.removeLabelButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Sound Selection Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onOpenSoundSelector}
              accessibilityRole="button"
            >
              <View style={styles.controlButtonTextContainer}>
                <Text style={styles.controlButtonSubtitle}>Sound</Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.controlButtonSubtitle}>
                  {selectedSound?.name || t("selectAlarmSound")}
                </Text>
                <Text style={styles.controlButtonArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Repeat Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setShowRepeatModal(true)}
              accessibilityRole="button"
            >
              <View style={styles.controlButtonTextContainer}>
                <Text style={styles.controlButtonSubtitle}>Repeat</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
            
                <Text style={styles.controlButtonSubtitle}>
                  {repeatSummary || "Once"}
                </Text>
                <Text style={styles.controlButtonArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Recording Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onOpenRecordingModal}
              accessibilityRole="button"
            >
              <View style={styles.controlButtonTextContainer}>
                <Text style={styles.controlButtonSubtitle}>
                  🎤 {t("recordCustomSound")}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.controlButtonArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Custom Voice Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onOpenCustomVoiceModal}
              accessibilityRole="button"
            >
              <View style={styles.controlButtonTextContainer}>
                <Text style={styles.controlButtonSubtitle}>
                  🤖 {t("generateCustomVoice")}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.controlButtonArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Delete Action (only when editing) */}
          {onDelete ? (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.deleteActionButton}
                onPress={onDelete}
                accessibilityLabel={t("delete")}
                accessibilityRole="button"
              >
                <Text style={styles.deleteActionButtonText}>{t("delete")}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Nested Modals */}
        <SoundSelector
          visible={showSoundSelector}
          selectedSound={selectedSound}
          availableSounds={availableSounds}
          selectedSoundId={selectedSoundId}
          onClose={onCloseSoundSelector}
          onSelectSound={onSelectSound}
          onDeleteCustomSound={onDeleteCustomSound}
          onOpenModal={() => {}} // Not needed in nested context
          onPreviewSound={onPreviewSound}
          previewingSoundId={previewingSoundId}
          showTrigger={false}
        />

        <RecordingModal
          showRecordingModal={showRecordingModal}
          showNamingModal={showNamingModal}
          isRecording={isRecording}
          recordingName={recordingName}
          recordingUri={recordingUri}
          onOpenRecordingModal={onOpenRecordingModal}
          onCloseRecordingModal={onCloseRecordingModal}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          onCancelRecording={onCancelRecording}
          onRecordingNameChange={onRecordingNameChange}
          onSaveRecording={onSaveRecording}
          onCancelNaming={onCancelNaming}
          onOpenCustomVoiceModal={onOpenCustomVoiceModal}
          showTriggers={false}
        />

        <CustomVoiceModal
          visible={showCustomVoiceModal}
          onClose={onCloseCustomVoiceModal}
          onGenerateVoice={onGenerateVoice}
          isGenerating={isGeneratingVoice}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
  },
  title: {
    ...TEXT_STYLES.headerTitle,
    color: "#1a1a1a",
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    ...TEXT_STYLES.closeButtonText,
    color: "#007AFF",
  },
  testButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
  },
  testButtonText: {
    ...TEXT_STYLES.closeButtonText,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteActionButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    ...TEXT_STYLES.closeButtonText,
    color: "blue",
  },
  deleteButtonText: {
    ...TEXT_STYLES.closeButtonText,
    color: "red",
  },
  deleteActionButtonText: {
    ...TEXT_STYLES.buttonText,
    color: "red",
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...TEXT_STYLES.sectionTitle,
    color: "#1a1a1a",
    marginBottom: 12,
  },
  timePickerContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  currentTimeText: {
    ...TEXT_STYLES.controlText,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
  },
  alarmButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  setAlarmButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setAlarmButtonText: {
    ...TEXT_STYLES.buttonText,
    color: "#ffffff",
  },
  cancelAlarmButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelAlarmButtonText: {
    ...TEXT_STYLES.buttonText,
    color: "#ffffff",
  },
  controlButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  controlButtonText: {
    ...TEXT_STYLES.controlText,
    color: "#1a1a1a",
  },
  controlButtonSubtitle: {
    ...TEXT_STYLES.controlText,
    color: "#1a1a1a",
  },
  controlButtonTextContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  controlButtonArrow: {
    ...TEXT_STYLES.buttonText,
    color: "#8e8e93",
    marginLeft: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  labelInput: {
    flex: 1,
    ...TEXT_STYLES.controlText,
    color: "#1a1a1a",
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 8,
    textAlign: "right",
  },
  labelInputInline: {
    ...TEXT_STYLES.controlText,
    color: "#1a1a1a",
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 8,
    textAlign: "right",
    minWidth: 80,
  },
  removeLabelButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8e8e93",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  removeLabelButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 16,
  },
});

export default ControlsBottomSheet;
