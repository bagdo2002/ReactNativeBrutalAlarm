import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";

const VoiceList = ({ visible, onClose, selectedVoice, onSelectVoice }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
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
    {
      id: "pirate",
      name: "Pirate Captain",
      description: "Rough, adventurous voice with swagger",
    },
    {
      id: "robot",
      name: "Robot",
      description: "Mechanical, precise voice",
    },
    {
      id: "wizard",
      name: "Wise Wizard",
      description: "Mystical, ancient voice",
    },
    {
      id: "chef",
      name: "Master Chef",
      description: "Passionate, culinary voice",
    },
    {
      id: "detective",
      name: "Private Detective",
      description: "Noir, mysterious voice",
    },
    {
      id: "astronaut",
      name: "Space Explorer",
      description: "Calm, scientific voice",
    },
    {
      id: "vampire",
      name: "Vampire Lord",
      description: "Dark, seductive voice",
    },
    {
      id: "cowboy",
      name: "Wild West Cowboy",
      description: "Gruff, adventurous voice",
    },
    {
      id: "ninja",
      name: "Stealth Ninja",
      description: "Whispered, mysterious voice",
    },
    {
      id: "superhero",
      name: "Superhero",
      description: "Heroic, inspiring voice",
    },
    {
      id: "villain",
      name: "Super Villain",
      description: "Sinister, menacing voice",
    },
    {
      id: "professor",
      name: "Eccentric Professor",
      description: "Intellectual, quirky voice",
    },
    {
      id: "surfer",
      name: "Chill Surfer",
      description: "Relaxed, laid-back voice",
    },
    {
      id: "britishButler",
      name: "British Butler",
      description: "Refined, proper voice",
    },
    {
      id: "gangster",
      name: "Classic Gangster",
      description: "Tough, street-smart voice",
    },
    {
      id: "medievalKnight",
      name: "Medieval Knight",
      description: "Noble, chivalrous voice",
    },
    {
      id: "alien",
      name: "Friendly Alien",
      description: "Otherworldly, curious voice",
    },
    {
      id: "ghost",
      name: "Friendly Ghost",
      description: "Ethereal, haunting voice",
    },
    {
      id: "mermaid",
      name: "Ocean Mermaid",
      description: "Enchanting, aquatic voice",
    },
    {
      id: "dragon",
      name: "Ancient Dragon",
      description: "Powerful, wise voice",
    },
    {
      id: "elf",
      name: "Forest Elf",
      description: "Melodic, nature voice",
    },
    {
      id: "dwarf",
      name: "Mountain Dwarf",
      description: "Sturdy, hearty voice",
    },
    {
      id: "angel",
      name: "Heavenly Angel",
      description: "Pure, divine voice",
    },
    {
      id: "demon",
      name: "Mischievous Demon",
      description: "Playful, devilish voice",
    },
    {
      id: "timeTraveler",
      name: "Time Traveler",
      description: "Mysterious, temporal voice",
    },
    {
      id: "spy",
      name: "Secret Agent",
      description: "Smooth, covert voice",
    },
    {
      id: "samurai",
      name: "Honorable Samurai",
      description: "Disciplined, respectful voice",
    },
    {
      id: "viking",
      name: "Fierce Viking",
      description: "Bold, warrior voice",
    },
    {
      id: "pharaoh",
      name: "Ancient Pharaoh",
      description: "Regal, commanding voice",
    },
    {
      id: "gladiator",
      name: "Roman Gladiator",
      description: "Fierce, battle-ready voice",
    },
    {
      id: "pirateQueen",
      name: "Pirate Queen",
      description: "Bold, adventurous voice",
    },
    {
      id: "cyberpunk",
      name: "Cyberpunk Hacker",
      description: "Tech-savvy, edgy voice",
    },
    {
      id: "steampunk",
      name: "Steampunk Inventor",
      description: "Victorian, mechanical voice",
    },
    {
      id: "zombie",
      name: "Friendly Zombie",
      description: "Groaning, undead voice",
    },
    {
      id: "werewolf",
      name: "Lone Werewolf",
      description: "Wild, primal voice",
    },
    {
      id: "fairy",
      name: "Magical Fairy",
      description: "Tiny, tinkling voice",
    },
    {
      id: "giant",
      name: "Gentle Giant",
      description: "Deep, booming voice",
    },
    {
      id: "troll",
      name: "Bridge Troll",
      description: "Gruff, territorial voice",
    },
    {
      id: "unicorn",
      name: "Mystical Unicorn",
      description: "Pure, magical voice",
    },
    {
      id: "phoenix",
      name: "Fire Phoenix",
      description: "Reborn, powerful voice",
    },
    {
      id: "griffin",
      name: "Noble Griffin",
      description: "Majestic, hybrid voice",
    },
    {
      id: "pegasus",
      name: "Winged Pegasus",
      description: "Graceful, soaring voice",
    },
    {
      id: "centaur",
      name: "Wise Centaur",
      description: "Ancient, hybrid voice",
    },
    {
      id: "minotaur",
      name: "Labyrinth Minotaur",
      description: "Powerful, maze voice",
    },
    {
      id: "sphinx",
      name: "Riddle Sphinx",
      description: "Mysterious, enigmatic voice",
    },
    {
      id: "hydra",
      name: "Multi-Headed Hydra",
      description: "Multiple, serpentine voice",
    },
    {
      id: "cerberus",
      name: "Guardian Cerberus",
      description: "Three-headed, protective voice",
    },
  ];

  // Filter voices based on search query
  const filteredVoices = useMemo(() => {
    if (!searchQuery.trim()) {
      return voiceOptions;
    }
    return voiceOptions.filter(
      (voice) =>
        voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, voiceOptions]);

  // Clear search input when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchQuery("");
    }
  }, [visible]);

  const handleVoiceSelect = (voiceId) => {
    onSelectVoice(voiceId);
    setSearchQuery(""); // Clear search when voice is selected
    onClose();
  };

  const handleClose = () => {
    setSearchQuery(""); // Clear search when closing manually
    onClose();
  };

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
          <Text style={styles.modalTitle}>{t("selectVoiceCharacter")}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t("searchVoices") || "Search voices..."}
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionDescription}>
              {t("voiceCharacterDescription")}
            </Text>
            {filteredVoices.length > 0 ? (
              filteredVoices.map((voice) => (
              <TouchableOpacity
                key={voice.id}
                style={[
                  styles.voiceOption,
                  selectedVoice === voice.id && styles.voiceOptionSelected,
                ]}
                onPress={() => handleVoiceSelect(voice.id)}
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
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  {t("noVoicesFound") || "No voices found"}
                </Text>
                <Text style={styles.noResultsSubtext}>
                  {t("tryDifferentSearch") || "Try a different search term"}
                </Text>
              </View>
            )}
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
  placeholder: {
    width: 60, // Same width as close button for centering
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
    color: "#000000",
  },
  section: {
    marginBottom: 25,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 15,
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
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
  },
});

export default VoiceList;
