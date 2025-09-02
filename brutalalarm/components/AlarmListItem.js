import React from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { TEXT_STYLES } from "./FontSystem";

const formatTime24 = (date) => {
  try {
    return date
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/^24:/, "00:");
  } catch (e) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
};

export default function AlarmListItem({
  time,
  isEnabled,
  onToggle,
  soundName,
  onPress,
  repeatDays = [],
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={onPress}
        activeOpacity={0.6}
      >
        <View style={styles.daysRow}> 
          {["S", "M", "T", "W", "T", "F", "S"].map((label, idx) => {
            const isSelected = Array.isArray(repeatDays) && repeatDays.includes(idx);
            return (
              <Text
                key={label + idx}
                style={[
                  styles.dayText,
                  { color: isSelected ? "#0aa7e9" : "#6b6b6b" },
                ]}
              >
                {label}
              </Text>
            );
          })}
        </View>
        <View style={styles.itemRow}>
          <View style={styles.leftColumn}>
            <Text style={styles.timeText}>{formatTime24(time)}</Text>
            <Text style={styles.subtitleText}>{soundName || "Alarm"}</Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={onToggle}
            trackColor={{ false: "#d1d1d6", true: "#34c759" }}
            thumbColor={"#ffffff"}
          />
        </View>
        <View style={styles.divider} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
     width: "100%",   
     alignItems: "center", // keep it centered horizontally
     marginBottom: 10,     // space between alarms
    },
  itemContainer: {
    padding: 15,
    margin: "0 auto",
    width: "90%",
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 10,
  },
  daysRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dayText: {
    ...TEXT_STYLES.smallCaption,
    letterSpacing: 1,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  leftColumn: {
    flexDirection: "column",
  },
  timeText: {
    ...TEXT_STYLES.splashTitle,
    color: "#000000",
    marginTop: 0,
    marginBottom:10,
    lineHeight: 40,
  },
  subtitleText: {
    ...TEXT_STYLES.bodyText,
    color: "#6b6b6b",
    marginTop: -4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e5ea",
  },
});
