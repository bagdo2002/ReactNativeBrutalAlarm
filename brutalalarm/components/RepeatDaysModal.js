import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { TEXT_STYLES } from "./FontSystem";

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const RepeatDaysModal = ({
  visible,
  selectedDays = [],
  onToggleDay,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Repeat</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.listContainer}>
          {DAY_LABELS.map((label, index) => {
            const isSelected = selectedDays.includes(index);
            return (
              <TouchableOpacity
                key={label}
                style={[styles.dayRow, isSelected && styles.dayRowSelected]}
                onPress={() => onToggleDay?.(index)}
                accessibilityRole="button"
                accessibilityLabel={`Toggle ${label}`}
              >
                <Text style={styles.dayText}>{label}</Text>
                {isSelected ? <Text style={styles.check}>✓</Text> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    ...TEXT_STYLES.sectionTitle,
    color: "#ffffff",
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  closeBtnText: {
    ...TEXT_STYLES.buttonText,
    color: "#000000",
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  dayRow: {
    cursor: "pointer",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "grey",
  },
  dayRowSelected: {
    borderWidth: 1,
   
  },
  dayText: {
    ...TEXT_STYLES.controlText,
    color: "#000000",
  },
  check: {
    ...TEXT_STYLES.buttonText,
    color: "grey",
  },
});

export default RepeatDaysModal;


