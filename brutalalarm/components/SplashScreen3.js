import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";

export default function SplashScreen3({ onNext }) {
  const { t } = useTranslation();

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background */}
      <View style={styles.background} />
      
      {/* Content */}
      <View style={styles.content}>
        {/* Voice Recording Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.microphoneIcon}>
            <View style={styles.imageContainer}>
              <Image
                source={require("../assets/nobackground/recordingalarm.png")}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          </View>
        
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('splashScreens.screen3.title')}</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            {t('splashScreens.screen3.description')}
          </Text>
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{t('splashScreens.screen3.nextButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
    width: "100%",
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  microphoneIcon: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 80,
    height: 80,
  },
  soundWaves: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  wave: {
    position: "absolute",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#ff6b6b",
    opacity: 0.3,
  },
  wave1: {
    width: 160,
    height: 160,
    top: -20,
    left: -20,
  },
  wave2: {
    width: 200,
    height: 200,
    top: -40,
    left: -40,
  },
  wave3: {
    width: 240,
    height: 240,
    top: -60,
    left: -60,
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2c3e50",
    textAlign: "center",
    letterSpacing: 1.5,
    textShadowColor: "#ff6b6b",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  descriptionContainer: {
    marginBottom: 50,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 22,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  nextButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 200,
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
  },
});
