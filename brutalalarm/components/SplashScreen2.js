import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useTranslation } from "react-i18next";

export default function SplashScreen2({ onNext }) {
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
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/nobackground/voicereminder-removebg-preview.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('splashScreens.screen2.title')}</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            {t('splashScreens.screen2.description')}
          </Text>
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{t('splashScreens.screen2.nextButton')}</Text>
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
  imageContainer: {
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
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
    textShadowColor: "#4ecdc4",
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
