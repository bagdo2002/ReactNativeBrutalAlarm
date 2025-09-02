import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { TEXT_STYLES } from "./FontSystem";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SplashScreen({ onAnimationFinish }) {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dot1Anim = useRef(new Animated.Value(0.5)).current;
  const dot2Anim = useRef(new Animated.Value(0.5)).current;
  const dot3Anim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const startAnimation = () => {
      // Start the main fade and scale animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // After main animation, show title
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Then show subtitle
          Animated.timing(subtitleAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            // Start pulse animation and loading dots
            const pulseAnimation = Animated.loop(
              Animated.sequence([
                Animated.timing(pulseAnim, {
                  toValue: 1.1,
                  duration: 600,
                  useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                  toValue: 1,
                  duration: 600,
                  useNativeDriver: true,
                }),
              ])
            );
            
            const dotsAnimation = Animated.loop(
              Animated.stagger(150, [
                Animated.sequence([
                  Animated.timing(dot1Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
                  Animated.timing(dot1Anim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
                ]),
                Animated.sequence([
                  Animated.timing(dot2Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
                  Animated.timing(dot2Anim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
                ]),
                Animated.sequence([
                  Animated.timing(dot3Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
                  Animated.timing(dot3Anim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
                ]),
              ])
            );
            
            pulseAnimation.start();
            dotsAnimation.start();

            // Auto-dismiss after showing content for 1 second
            setTimeout(() => {
              pulseAnimation.stop();
              dotsAnimation.stop();
              // Fade out animation
              Animated.parallel([
                Animated.timing(fadeAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                  toValue: 0.8,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                onAnimationFinish();
              });
            }, 1000);
          });
        });
      });
    };

    // Start animation after a brief delay
    const timer = setTimeout(startAnimation, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* App Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Image
            source={require("../assets/alarmlogo.png")}
            style={styles.appIcon}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.appTitle}>{t("appTitle").toUpperCase()}</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View
          style={[
            styles.subtitleContainer,
            {
              opacity: subtitleAnim,
              transform: [
                {
                  translateY: subtitleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.subtitle}>{t("splashScreen.subtitle")}</Text>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
            <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
            <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Bottom branding */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            opacity: subtitleAnim,
          },
        ]}
      >
        <Text style={styles.brandText}>{t("splashScreen.brandText")}</Text>
      </Animated.View>
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
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
    // Add a subtle radial gradient effect with opacity
    shadowColor: "#cccccc",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 100,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  appIcon: {
    width: 120,
    height: 120,
    borderRadius: 25,
  },
  titleContainer: {
    marginBottom: 15,
  },
  appTitle: {
    ...TEXT_STYLES.splashTitle,
    color: "#000000",
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "#cccccc",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitleContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  subtitle: {
    ...TEXT_STYLES.splashSubtitle,
    color: "#666666",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 30,
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#999999",
    marginHorizontal: 4,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
  },
  brandText: {
    ...TEXT_STYLES.caption,
    color: "#999999",
    letterSpacing: 0.5,
  },
});
