import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Audio } from "expo-av";

/**
 * RecordingModal Component - Apple Voice Memos Style
 *
 * Features:
 * - Circular waveform-style recording button
 * - Clean minimalist design with iOS-style typography and colors
 * - Real-time waveform visualization responding to audio input (simulated)
 * - Smooth animations and visual feedback
 */
const RecordingModal = ({
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
  showTriggers = true,
}) => {
  const { t } = useTranslation();

  // State for timer and audio
  const [recordingTime, setRecordingTime] = useState(0);
  const [beepSound, setBeepSound] = useState(null);
  const [previewSound, setPreviewSound] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Refs for intervals and recording
  const intervalRef = useRef(null);
  const recordingRef = useRef(null);

  // Request microphone permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Microphone permission denied");
        // Optionally, alert the user to enable permissions
      }
    };
    requestPermissions();
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Load beep sound
  useEffect(() => {
    const loadBeepSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/audio/beep.mp3")
        );
        setBeepSound(sound);
      } catch (error) {
        console.log("Error loading beep sound:", error);
      }
    };

    loadBeepSound();

    return () => {
      if (beepSound) {
        beepSound.unloadAsync();
      }
    };
  }, []);

  // Play beep sound
  const playBeepSound = async () => {
    try {
      if (beepSound) {
        await beepSound.replayAsync();
      }
    } catch (error) {
      console.log("Error playing beep sound:", error);
    }
  };

  // Load preview sound for naming modal
  useEffect(() => {
    if (showNamingModal && recordingUri && !previewSound) {
      const loadPreviewSound = async () => {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });

          const { sound } = await Audio.Sound.createAsync({
            uri: recordingUri,
          });
          setPreviewSound(sound);
        } catch (error) {
          console.log("Error loading preview sound:", error);
        }
      };

      loadPreviewSound();
    }

    if (!showNamingModal && previewSound) {
      previewSound.unloadAsync();
      setPreviewSound(null);
      setIsPlayingPreview(false);
    }

    return () => {
      if (previewSound) {
        previewSound.unloadAsync();
      }
    };
  }, [showNamingModal, recordingUri]);

  // Play or stop preview sound
  const playPreviewSound = async () => {
    try {
      if (previewSound) {
        if (isPlayingPreview) {
          await previewSound.stopAsync();
          setIsPlayingPreview(false);
        } else {
          // Reset the sound to the beginning before playing
          await previewSound.setPositionAsync(0);
          previewSound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              setIsPlayingPreview(false);
            }
          });
          await previewSound.playAsync();
          setIsPlayingPreview(true);
        }
      }
    } catch (error) {
      console.log("Error playing preview sound:", error);
      setIsPlayingPreview(false);
    }
  };

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      // Reset timer when recording starts
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      // Clear timer when recording stops
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording]);

  // Reset timer when modal closes
  useEffect(() => {
    if (!showRecordingModal) {
      setRecordingTime(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [showRecordingModal]);

  return (
    <>
      {/* Recording Buttons in Main UI */}
      {showTriggers && (
        <View style={styles.recordingSection}>
          <Text style={styles.sectionTitle}>{t("customSounds")}</Text>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={onOpenRecordingModal}
            accessibilityLabel={t("recordVoice")}
            accessibilityRole="button"
          >
            <View style={styles.recordButtonIcon}>
              <View style={styles.recordButtonDot} />
            </View>
            <Text style={styles.recordButtonText}>{t("recordVoice")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.customVoiceButton}
            onPress={onOpenCustomVoiceModal}
            accessibilityLabel={t("createCustomVoice")}
            accessibilityRole="button"
          >
            <Text style={styles.customVoiceButtonText}>
              {t("createCustomVoice")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recording Modal */}
      <Modal
        visible={showRecordingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancelRecording}
              accessibilityLabel={t("cancel")}
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>{t("Cancel")}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t("New Recording")}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.recordingContent}>
            <View style={styles.recordingStatusContainer}>
              {isRecording ? (
                <View style={styles.recordingStatus}></View>
              ) : (
                <View style={styles.readyStatus}>
                  <Text style={styles.readyText}>{t("Tap to record")}</Text>
                </View>
              )}
            </View>

            {isRecording && (
              <View style={styles.timeContainer}>
                <Text style={styles.recordingTime}>
                  {formatTime(recordingTime)}
                </Text>
              </View>
            )}

            <View style={styles.recordingControls}>
              <TouchableOpacity
                style={[
                  styles.mainRecordButton,
                  isRecording && styles.mainRecordButtonRecording,
                ]}
                onPress={async () => {
                  await playBeepSound();
                  if (isRecording) {
                    onStopRecording();
                  } else {
                    onStartRecording();
                  }
                }}
                activeOpacity={0.7}
                accessibilityLabel={
                  isRecording ? t("Stop recording") : t("Start recording")
                }
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.recordButtonInner,
                    isRecording && styles.recordButtonInnerRecording,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomControls}>
              {!isRecording && (
                <Text style={styles.instructionText}>{t("Tap to record")}</Text>
              )}
              {isRecording && (
                <Text style={styles.recordingIndicator}>
                  {t("Tap to stop")}
                </Text>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Naming Modal */}
      <Modal
        visible={showNamingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancelNaming}
              accessibilityLabel={t("cancel")}
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>{t("Cancel")}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t("Save Recording")}</Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSaveRecording}
              accessibilityLabel={t("save")}
              accessibilityRole="button"
            >
              <Text style={styles.saveButtonText}>{t("Save")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.namingContent}>
            <View style={styles.recordingPreview}>

              <TouchableOpacity
                style={styles.previewPlayButton}
                onPress={playPreviewSound}
                disabled={!previewSound}
                accessibilityLabel={
                  isPlayingPreview ? t("Stop preview") : t("Play preview")
                }
                accessibilityRole="button"
              >
                <View style={styles.previewPlayIcon}>
                  {isPlayingPreview ? (
                    <View style={styles.stopIcon} />
                  ) : (
                    <View style={styles.playIcon} />
                  )}
                </View>
                <Text style={styles.previewPlayText}>
                  {isPlayingPreview ? t("Stop") : t("Play")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("Title")}</Text>
              <TextInput
                style={styles.nameInput}
                value={recordingName}
                onChangeText={onRecordingNameChange}
                placeholder={t("New Recording")}
                placeholderTextColor="#8E8E93"
                autoFocus={true}
                maxLength={50}
                returnKeyType="done"
                onSubmitEditing={onSaveRecording}
                accessibilityLabel={t("enterRecordingName")}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  recordingSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  recordButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordButtonIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#FF3B30",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recordButtonDot: {
    width: 12,
    height: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
  },
  recordButtonText: {
    color: "#1C1C1E",
    fontSize: 17,
    fontWeight: "400",
  },
  customVoiceButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  customVoiceButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "#C6C6C8",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    textAlign: "center",
    flex: 1,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    fontSize: 17,
    color: "#007AFF",
    fontWeight: "400",
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  saveButtonText: {
    fontSize: 17,
    color: "#007AFF",
    fontWeight: "600",
  },
  headerSpacer: {
    width: 60,
  },
  recordingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  recordingStatusContainer: {
    height: 200,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  recordingStatus: {
    alignItems: "center",
    justifyContent: "center",
  },
  recordingIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  recordingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  recordingStatusText: {
    fontSize: 20,
    color: "#FF3B30",
    fontWeight: "600",
  },
  readyStatus: {
    alignItems: "center",
    justifyContent: "center",
  },
  readyText: {
    fontSize: 17,
    color: "#8E8E93",
    fontWeight: "400",
  },
  timeContainer: {
    marginBottom: 40,
  },
  recordingTime: {
    fontSize: 48,
    fontWeight: "200",
    color: "#FF3B30",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  recordingControls: {
    alignItems: "center",
    marginBottom: 60,
  },
  mainRecordButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  mainRecordButtonRecording: {
    backgroundColor: "#FF3B30",
    borderWidth: 8,
    borderColor: "#FFFFFF",
    width: 84,
    height: 84,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  recordButtonInner: {
    width: "100%",
    height: "100%",
    borderRadius: 42,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  recordButtonInnerRecording: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#FF3B30",
  },
  bottomControls: {
    alignItems: "center",
  },
  instructionText: {
    fontSize: 17,
    color: "#8E8E93",
    fontWeight: "400",
    textAlign: "center",
  },
  recordingIndicator: {
    fontSize: 17,
    color: "#FF3B30",
    fontWeight: "500",
    textAlign: "center",
  },
  namingContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  recordingPreview: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    alignItems: "center",
  },
  previewIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  previewIconInner: {
    width: 24,
    height: 24,
    backgroundColor: "#007AFF",
    borderRadius: 12,
  },
  previewPlayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  previewPlayIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  playIcon: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: "#FFFFFF",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
  },
  stopIcon: {
    width: 12,
    height: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
  previewPlayText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "400",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nameInput: {
    fontSize: 17,
    color: "#1C1C1E",
    fontWeight: "400",
    paddingVertical: 8,
    borderWidth: 0,
  },
});

export default RecordingModal;
