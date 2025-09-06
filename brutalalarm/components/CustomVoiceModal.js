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
import VoiceList from "./VoiceList";

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
  const [showVoiceList, setShowVoiceList] = useState(false);

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
    setShowVoiceList(false);
    onClose();
  };

  const handleVoiceSelect = (voiceId) => {
    setSelectedVoice(voiceId);
  };

  const getSelectedVoiceName = () => {
    const voiceOptions = [
      { id: "navySeal", name: "Navy SEAL" },
      { id: "yogaInstructor", name: "Yoga Instructor" },
      { id: "drillSergeant", name: "Drill Sergeant" },
      { id: "motivationalCoach", name: "Motivational Coach" },
      { id: "gentle", name: "Gentle" },
      { id: "energetic", name: "Energetic" },
    ];
    const selected = voiceOptions.find((voice) => voice.id === selectedVoice);
    return selected ? selected.name : "Navy SEAL";
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
          </TouchableOpacity>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("selectVoiceCharacter")}</Text>
            <Text style={styles.sectionDescription}>
              {t("voiceCharacterDescription")}
            </Text>
            <TouchableOpacity
              style={styles.voiceSelectionButton}
              onPress={() => setShowVoiceList(true)}
              accessibilityLabel={t("selectVoiceCharacter")}
              accessibilityRole="button"
            >
              <View style={styles.voiceSelectionContent}>
                <Text style={styles.voiceSelectionLabel}>
                  {t("selectedVoice")}: {getSelectedVoiceName()}
                </Text>
                <Text style={styles.voiceSelectionArrow}>›</Text>
              </View>
            </TouchableOpacity>
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
          {/* Voice List Modal */}
          <VoiceList
            visible={showVoiceList}
            onClose={() => setShowVoiceList(false)}
            selectedVoice={selectedVoice}
            onSelectVoice={handleVoiceSelect}
          />

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

          {/* Voice Selection Section */}
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
  voiceSelectionButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 15,
  },
  voiceSelectionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voiceSelectionLabel: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  voiceSelectionArrow: {
    fontSize: 20,
    color: "#666666",
    fontWeight: "300",
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
