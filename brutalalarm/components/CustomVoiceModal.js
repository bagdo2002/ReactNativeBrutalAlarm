import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { VOICES } from "../elevenlabs";

/**
 * CustomVoiceModal Component
 *
 * Handles text-to-speech custom voice creation interface.
 * Allows users to input text, select a voice character, and generate custom voice recordings.
 *
 * Props:
 * - visible: boolean - Whether the modal is visible
 * - onClose: function - Callback to close the modal
 * - onGenerateVoice: function - Callback to generate TTS voice with (text, voiceId, name)
 * - isGenerating: boolean - Whether TTS generation is in progress
 *
 * Features:
 * - Text input for custom messages
 * - Voice character selection
 * - Name input for saving the custom voice
 * - Generate and save functionality
 */
const CustomVoiceModal = ({
  visible,
  onClose,
  onGenerateVoice,
  isGenerating = false,
}) => {
  const { t } = useTranslation();

  const [customText, setCustomText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("navySeal");
  const [voiceName, setVoiceName] = useState("");

  // Voice options with display names
  const voiceOptions = [
    {
      id: "navySeal",
      name: "Navy SEAL",
      description: "Deep, commanding voice",
    },
    {
      id: "yogaInstructor",
      name: "Yoga Instructor",
      description: "Calm, soothing voice",
    },
    {
      id: "drillSergeant",
      name: "Drill Sergeant",
      description: "Intense, aggressive voice",
    },
    {
      id: "motivationalCoach",
      name: "Motivational Coach",
      description: "Energetic, inspiring voice",
    },
    { id: "gentle", name: "Gentle", description: "Soft, gentle voice" },
    { id: "energetic", name: "Energetic", description: "High energy voice" },
  ];

  const handleGenerate = () => {
    if (!customText.trim()) {
      return;
    }
    if (!voiceName.trim()) {
      return;
    }

    onGenerateVoice(customText.trim(), selectedVoice, voiceName.trim());
  };

  const handleClose = () => {
    setCustomText("");
    setVoiceName("");
    setSelectedVoice("navySeal");
    onClose();
  };

  const isFormValid =
    customText.trim().length > 0 && voiceName.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityLabel={t("cancel")}
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>{t("cancel")}</Text>
          </TouchableOpacity>{" "}
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Text Input Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("customMessage")}</Text>
            <Text style={styles.sectionDescription}>
              {t("customMessageDescription")}
            </Text>
            <TextInput
              style={styles.textInput}
              value={customText}
              onChangeText={setCustomText}
              placeholder={t("enterCustomMessage")}
              placeholderTextColor="#999999"
              multiline={true}
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
              accessibilityLabel={t("enterCustomMessage")}
            />
            <Text style={styles.characterCount}>{customText.length}/500</Text>
          </View>

          {/* Voice Selection Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("selectVoiceCharacter")}</Text>
            <Text style={styles.sectionDescription}>
              {t("voiceCharacterDescription")}
            </Text>
            {voiceOptions.map((voice) => (
              <TouchableOpacity
                key={voice.id}
                style={[
                  styles.voiceOption,
                  selectedVoice === voice.id && styles.voiceOptionSelected,
                ]}
                onPress={() => setSelectedVoice(voice.id)}
                accessibilityLabel={`${voice.name} - ${voice.description}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedVoice === voice.id }}
              >
                <View style={styles.voiceOptionContent}>
                  <Text style={styles.voiceOptionName}>{voice.name}</Text>
                  <Text style={styles.voiceOptionDescription}>
                    {voice.description}
                  </Text>
                </View>
                {selectedVoice === voice.id && (
                  <Text style={styles.selectedIndicator}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Name Input Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("customVoiceName")}</Text>
            <Text style={styles.sectionDescription}>
              {t("customVoiceNameDescription")}
            </Text>
            <TextInput
              style={styles.nameInput}
              value={voiceName}
              onChangeText={setVoiceName}
              placeholder={t("enterCustomVoiceName")}
              placeholderTextColor="#999999"
              maxLength={50}
              returnKeyType="done"
              accessibilityLabel={t("enterCustomVoiceName")}
            />
          </View>

          {/* Generate Button */}
          <View style={styles.generateSection}>
            <TouchableOpacity
              style={[
                styles.generateButton,
                (!isFormValid || isGenerating) && styles.generateButtonDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!isFormValid || isGenerating}
              accessibilityLabel={t("generateCustomVoice")}
              accessibilityRole="button"
            >
              {isGenerating ? (
                <View style={styles.generatingContent}>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={styles.generateButtonText}>
                    {t("generatingVoice")}
                  </Text>
                </View>
              ) : (
                <Text style={styles.generateButtonText}>
                  {t("generateCustomVoice")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#000000",
    minHeight: 100,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    color: "#999999",
    textAlign: "right",
    marginTop: 5,
  },
  voiceOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  voiceOptionSelected: {
    backgroundColor: "#e8e8e8",
    borderColor: "#666666",
  },
  voiceOptionContent: {
    flex: 1,
  },
  voiceOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  voiceOptionDescription: {
    fontSize: 14,
    color: "#666666",
  },
  selectedIndicator: {
    fontSize: 18,
    color: "#666666",
    fontWeight: "700",
    marginLeft: 10,
  },
  nameInput: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#000000",
  },
  generateSection: {
    marginBottom: 25,
  },
  generateButton: {
    backgroundColor: "#000000",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  generateButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  generateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  generatingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tipsSection: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 22,
  },
});

export default CustomVoiceModal;
