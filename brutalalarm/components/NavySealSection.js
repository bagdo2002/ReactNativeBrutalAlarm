import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';

/**
 * NavySealSection Component
 * 
 * Provides interface for character voice wake-up calls including Navy SEAL and other characters.
 * Includes both quick calls and custom message functionality.
 * 
 * Props:
 * - showNavySealModal: boolean - Whether the custom message modal is visible
 * - navySealText: string - Custom message text
 * - selectedNavySealVoice: string - Selected character voice type
 * - onQuickCall: function - Callback for quick Navy SEAL call
 * - onOpenCustomModal: function - Callback to open custom message modal
 * - onCloseModal: function - Callback to close custom message modal
 * - onTextChange: function - Callback when custom text changes
 * - onVoiceChange: function - Callback when voice selection changes
 * - onSubmitCustom: function - Callback to submit custom message
 * - onSaveCustomVoice: function - Callback to save custom voice as recording
 * - isSavingVoice: boolean - Whether voice saving is in progress
 * - onPreviewVoice: function - Callback to preview voice before saving
 * - isPreviewingVoice: boolean - Whether voice preview is in progress
 * 
 * Features:
 * - Quick Navy SEAL wake-up call button
 * - Custom message interface with character selection
 * - Multiple character voice options (Navy SEAL, Drill Sergeant, Coach, etc.)
 * - Character count and input validation
 * - Visual character selection grid
 */
const NavySealSection = ({
  showNavySealModal,
  navySealText,
  selectedNavySealVoice,
  onQuickCall,
  onOpenCustomModal,
  onCloseModal,
  onTextChange,
  onVoiceChange,
  onSubmitCustom,
  onSaveCustomVoice,
  isSavingVoice = false,
  onPreviewVoice,
  isPreviewingVoice = false,
}) => {
  const { t } = useTranslation();

  /**
   * Character voice options with their display information
   */
  const characterVoices = [
    {
      id: "navySeal",
      name: "Navy SEAL",
      emoji: "🎖️",
    },
    {
      id: "drillSergeant",
      name: "Drill Sergeant",
      emoji: "⚡",
    },
    {
      id: "motivationalCoach",
      name: "Coach",
      emoji: "🏆",
    },
    {
      id: "energetic",
      name: "Energetic",
      emoji: "⚡",
    },
    {
      id: "yogaInstructor",
      name: "Yoga",
      emoji: "🧘",
    },
    {
      id: "gentle",
      name: "Gentle",
      emoji: "😊",
    },
  ];

  return (
    <>
      {/* Navy SEAL Section in Main UI */}
      <View style={styles.navySealSection}>
        <Text style={styles.navySealTitle}>🎖️ Navy SEAL Wake-Up Call</Text>
        <Text style={styles.navySealDescription}>
          Get a brutal wake-up call from a Navy SEAL character
        </Text>
        
        {/* Action Buttons */}
        <View style={styles.navySealButtons}>
          {/* Quick SEAL Call Button */}
          <TouchableOpacity
            style={styles.navySealQuickButton}
            onPress={onQuickCall}
            accessibilityLabel="Quick SEAL Call"
            accessibilityRole="button"
          >
            <Text style={styles.navySealQuickButtonText}>
              Quick SEAL Call
            </Text>
          </TouchableOpacity>
          
          {/* Custom Message Button */}
          <TouchableOpacity
            style={styles.navySealCustomButton}
            onPress={onOpenCustomModal}
            accessibilityLabel="Custom Message"
            accessibilityRole="button"
          >
            <Text style={styles.navySealCustomButtonText}>
              Custom Message
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navy SEAL Custom Message Modal */}
      <Modal
        visible={showNavySealModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎖️ Custom Character Message</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onCloseModal}
              accessibilityLabel={t("cancel")}
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.navySealModalContent}>
            {/* Instructions */}
            <Text style={styles.navySealModalInstructions}>
              Type your custom wake-up message and choose which character voice
              will deliver it!
            </Text>

            {/* Custom Message Input */}
            <TextInput
              style={styles.navySealTextInput}
              value={navySealText}
              onChangeText={onTextChange}
              placeholder="Enter your brutal wake-up message..."
              placeholderTextColor="#999999"
              multiline={true}
              numberOfLines={4}
              maxLength={200}
              returnKeyType="done"
              blurOnSubmit={true}
              accessibilityLabel="Custom wake-up message"
            />

            {/* Character Count */}
            <Text style={styles.navySealCharCount}>
              {navySealText.length}/200 characters
            </Text>

            {/* Character Voice Selection */}
            <View style={styles.navySealVoiceSelection}>
              <Text style={styles.navySealVoiceTitle}>
                Choose Character Voice:
              </Text>
              
              {/* Character Voice Grid */}
              <View style={styles.navySealVoiceGrid}>
                {characterVoices.map((voice) => (
                  <TouchableOpacity
                    key={voice.id}
                    style={[
                      styles.navySealVoiceButton,
                      selectedNavySealVoice === voice.id &&
                        styles.navySealVoiceButtonSelected,
                    ]}
                    onPress={() => onVoiceChange(voice.id)}
                    accessibilityLabel={`${voice.name} voice ${selectedNavySealVoice === voice.id ? 'selected' : ''}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.navySealVoiceEmoji}>{voice.emoji}</Text>
                    <Text style={styles.navySealVoiceName}>{voice.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.navySealModalButtons}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.navySealCancelButton}
                onPress={onCloseModal}
                accessibilityLabel={t("cancel")}
                accessibilityRole="button"
              >
                <Text style={styles.navySealCancelButtonText}>
                  {t("cancel")}
                </Text>
              </TouchableOpacity>
              
              {/* Preview Voice Button */}
              <TouchableOpacity
                style={[
                  styles.navySealPreviewButton,
                  (!navySealText.trim() || isPreviewingVoice) && styles.navySealPreviewButtonDisabled,
                ]}
                onPress={onPreviewVoice}
                disabled={!navySealText.trim() || isPreviewingVoice}
                accessibilityLabel={isPreviewingVoice ? "Previewing..." : "Preview"}
                accessibilityRole="button"
              >
                {isPreviewingVoice ? (
                  <View style={styles.savingContent}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.navySealPreviewButtonText}>...</Text>
                  </View>
                ) : (
                  <Text style={styles.navySealPreviewButtonText}>▶️</Text>
                )}
              </TouchableOpacity>
              
              {/* Save Voice Button */}
              <TouchableOpacity
                style={[
                  styles.navySealSaveButton,
                  (!navySealText.trim() || isSavingVoice) && styles.navySealSaveButtonDisabled,
                ]}
                onPress={onSaveCustomVoice}
                disabled={!navySealText.trim() || isSavingVoice}
                accessibilityLabel={isSavingVoice ? "Saving Voice..." : "Save"}
                accessibilityRole="button"
              >
                {isSavingVoice ? (
                  <View style={styles.savingContent}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.navySealSaveButtonText}>...</Text>
                  </View>
                ) : (
                  <Text style={styles.navySealSaveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Navy SEAL Section styles (main UI)
  navySealSection: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 15,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  navySealTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  navySealDescription: {
    fontSize: 14,
    color: "#cccccc",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 18,
  },
  navySealButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  navySealQuickButton: {
    flex: 1,
    backgroundColor: "#444444",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  navySealQuickButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  navySealCustomButton: {
    flex: 1,
    backgroundColor: "#666666",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  navySealCustomButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Modal container styles
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
    color: "#666666",
    fontWeight: "600",
  },

  // Modal content styles
  navySealModalContent: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  navySealModalInstructions: {
    fontSize: 18,
    color: "#777777",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  navySealTextInput: {
    backgroundColor: "#f5f5f5",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#000000",
    marginBottom: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  navySealCharCount: {
    fontSize: 12,
    color: "#999999",
    textAlign: "right",
    marginBottom: 20,
  },

  // Voice selection styles
  navySealVoiceSelection: {
    marginBottom: 30,
  },
  navySealVoiceTitle: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  navySealVoiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  navySealVoiceButton: {
    width: "48%",
    backgroundColor: "#f5f5f5",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  navySealVoiceButtonSelected: {
    backgroundColor: "#e8f4fd",
    borderColor: "#1a73e8",
  },
  navySealVoiceEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  navySealVoiceName: {
    fontSize: 12,
    color: "#333333",
    fontWeight: "600",
    textAlign: "center",
  },

  // Modal action buttons
  navySealModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  navySealCancelButton: {
    flex: 1,
    backgroundColor: "#777777",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  navySealCancelButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  navySealPreviewButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 50,
  },
  navySealPreviewButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  navySealPreviewButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  navySealSaveButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  navySealSaveButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  navySealSaveButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  savingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navySealPlayButton: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  navySealPlayButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  navySealPlayButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default NavySealSection;
