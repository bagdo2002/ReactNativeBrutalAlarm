import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';

/**
 * SoundSelector Component
 * 
 * Provides UI for selecting alarm sounds and managing custom recordings.
 * Includes both a trigger button and a modal with the full sound selection interface.
 * 
 * Props:
 * - visible: boolean - Whether the sound selector modal is visible
 * - selectedSound: object - Currently selected sound object
 * - availableSounds: array - List of all available sounds (default + custom)
 * - selectedSoundId: string - ID of currently selected sound
 * - onClose: function - Callback to close the modal
 * - onSelectSound: function - Callback when a sound is selected
 * - onDeleteCustomSound: function - Callback to delete a custom sound
 * - onOpenModal: function - Callback to open the sound selector modal
 * - onPreviewSound: function - Callback to preview a sound
 * - previewingSoundId: string - ID of sound currently being previewed
 * 
 * Features:
 * - Displays current selected sound in main UI
 * - Modal with scrollable list of all available sounds
 * - Delete functionality for custom sounds
 * - Visual indication of selected sound
 * - Preview button shows different icon when playing
 */
const SoundSelector = ({
  visible,
  selectedSound,
  availableSounds,
  selectedSoundId,
  onClose,
  onSelectSound,
  onDeleteCustomSound,
  onOpenModal,
  onPreviewSound,
  previewingSoundId,
  // When false, hides the inline trigger so this component can be used as a nested modal
  showTrigger = true,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Sound Selection Trigger Button (optional) */}
      {showTrigger && (
        <View style={styles.soundSection}>
          <Text style={styles.sectionTitle}>{t("alarmSound")}</Text>
          <TouchableOpacity
            style={styles.soundSelector}
            onPress={onOpenModal}
            accessibilityLabel={t("selectAlarmSound")}
            accessibilityRole="button"
          >
            <Text style={styles.soundSelectorText}>
              {selectedSound?.name || t("selectSound")}
            </Text>
            <Text style={styles.soundSelectorArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sound Selector Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("selectAlarmSound")}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel={t("done")}
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonText}>{t("done")}</Text>
            </TouchableOpacity>
          </View>

          {/* Sound List */}
          <ScrollView style={styles.soundList}>
            {availableSounds.map((soundItem) => (
              <TouchableOpacity
                key={soundItem.id}
                style={[
                  styles.soundItem,
                  selectedSoundId === soundItem.id && styles.soundItemSelected,
                ]}
                onPress={() => onSelectSound(soundItem.id)}
                accessibilityLabel={`${soundItem.name} ${selectedSoundId === soundItem.id ? 'selected' : ''}`}
                accessibilityRole="button"
              >
                <View style={styles.soundItemContent}>
                  <View style={styles.soundItemInfo}>
                    {/* Sound Name */}
                    <Text style={styles.soundItemName}>{soundItem.name}</Text>
                    {/* Sound Type Indicator */}
                    {soundItem.isCustomVoice && (
                      <Text style={styles.soundTypeIndicator}>🤖 Custom Voice</Text>
                    )}
                    {soundItem.isCustom && !soundItem.isCustomVoice && (
                      <Text style={styles.soundTypeIndicator}>🎤 Recorded</Text>
                    )}
                  </View>
                  
                  {/* Action Buttons for Custom Sounds */}
                  {soundItem.isCustom && (
                    <View style={styles.customSoundActions}>
                      <TouchableOpacity
                        style={styles.previewButton}
                        onPress={() => onPreviewSound && onPreviewSound(soundItem)}
                        accessibilityLabel={previewingSoundId === soundItem.id ? "Playing..." : t("preview")}
                        accessibilityRole="button"
                      >
                        <Text style={styles.previewButtonText}>
                          {previewingSoundId === soundItem.id ? "=" : "▶️"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onDeleteCustomSound(soundItem.id)}
                        accessibilityLabel={t("delete")}
                        accessibilityRole="button"
                      >
                        <Text style={styles.deleteButtonText}>{t("delete")}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                {/* Selected Indicator */}
                {selectedSoundId === soundItem.id && (
                  <Text style={styles.selectedIndicator}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Sound section styles (main UI)
  soundSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  soundSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  soundSelectorText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  soundSelectorArrow: {
    fontSize: 20,
    color: "#999999",
    fontWeight: "300",
  },
  
  // Modal styles
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
  
  // Sound list styles
  soundList: {
    flex: 1,
    padding: 20,
  },
  soundItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  soundItemSelected: {
    backgroundColor: "#e8e8e8",
    borderColor: "#666666",
  },
  soundItemContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  soundItemInfo: {
    flex: 1,
  },
  soundItemName: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
    marginBottom: 2,
  },
  soundTypeIndicator: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
  customSoundActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 32,
    alignItems: "center",
  },
  previewButtonText: {
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: "#777777",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  selectedIndicator: {
    fontSize: 18,
    color: "#666666",
    fontWeight: "700",
    marginLeft: 10,
  },
});

export default SoundSelector;
