import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  StatusBar,
  Image,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function FeaturesSplashScreen({ onAnimationFinish, onNext }) {
  const { t } = useTranslation();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const featuresAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Individual feature animations
  const feature1Anim = useRef(new Animated.Value(0)).current;
  const feature2Anim = useRef(new Animated.Value(0)).current;
  const feature3Anim = useRef(new Animated.Value(0)).current;
  const feature4Anim = useRef(new Animated.Value(0)).current;
  const feature5Anim = useRef(new Animated.Value(0)).current;
  const feature6Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      // Start the main fade and scale animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // After main animation, show title
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          // Then show subtitle
          Animated.timing(subtitleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            // Show features container
            Animated.timing(featuresAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start(() => {
              // Animate features one by one with stagger
              Animated.stagger(150, [
                Animated.spring(feature1Anim, {
                  toValue: 1,
                  tension: 100,
                  friction: 8,
                  useNativeDriver: true,
                }),
                Animated.spring(feature2Anim, {
                  toValue: 1,
                  tension: 100,
                  friction: 8,
                  useNativeDriver: true,
                }),
                Animated.spring(feature3Anim, {
                  toValue: 1,
                  tension: 100,
                  friction: 8,
                  useNativeDriver: true,
                }),
                Animated.spring(feature4Anim, {
                  toValue: 1,
                  tension: 100,
                  friction: 8,
                  useNativeDriver: true,
                }),
                Animated.spring(feature5Anim, {
                  toValue: 1,
                  tension: 100,
                  friction: 8,
                  useNativeDriver: true,
                }),
                Animated.spring(feature6Anim, {
                  toValue: 1,
                  tension: 100,
                  friction: 8,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                // Show button after all features are visible
                Animated.timing(buttonAnim, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: true,
                }).start(() => {
                  // Start pulse animation for the button
                  const pulseAnimation = Animated.loop(
                    Animated.sequence([
                      Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 1000,
                        useNativeDriver: true,
                      }),
                      Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                      }),
                    ])
                  );
                  pulseAnimation.start();
                });
              });
            });
          });
        });
      });
    };

    // Start animation after a brief delay
    const timer = setTimeout(startAnimation, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  const features = [
    {
      icon: "🎤",
      title: t("featuresSplashScreen.features.recordVoice.title"),
      description: t("featuresSplashScreen.features.recordVoice.description"),
      anim: feature1Anim,
    },
    {
      icon: "🤖",
      title: t("featuresSplashScreen.features.aiVoice.title"),
      description: t("featuresSplashScreen.features.aiVoice.description"),
      anim: feature2Anim,
    },
    {
      icon: "🔊",
      title: t("featuresSplashScreen.features.multipleSounds.title"),
      description: t("featuresSplashScreen.features.multipleSounds.description"),
      anim: feature3Anim,
    },
    {
      icon: "⏰",
      title: t("featuresSplashScreen.features.smartScheduling.title"),
      description: t("featuresSplashScreen.features.smartScheduling.description"),
      anim: feature4Anim,
    },
    {
      icon: "🌐",
      title: t("featuresSplashScreen.features.multiLanguage.title"),
      description: t("featuresSplashScreen.features.multiLanguage.description"),
      anim: feature5Anim,
    },
    {
      icon: "💪",
      title: t("featuresSplashScreen.features.dailyMotivation.title"),
      description: t("featuresSplashScreen.features.dailyMotivation.description"),
      anim: feature6Anim,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
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
          <Text style={styles.appTitle}>{t("featuresSplashScreen.title")}</Text>
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
          <Text style={styles.subtitle}>{t("featuresSplashScreen.subtitle")}</Text>
        </Animated.View>

        {/* Features List */}
        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: featuresAnim,
            },
          ]}
        >
          {features.map((feature, index) => (
            <Animated.View
              key={index}
              style={[
                styles.featureItem,
                {
                  opacity: feature.anim,
                  transform: [
                    {
                      translateX: feature.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                    { scale: feature.anim },
                  ],
                },
              ]}
            >
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Next Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{t("featuresSplashScreen.nextButton")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f8f9fa",
    shadowColor: "#e9ecef",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
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
    marginBottom: 20,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  titleContainer: {
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2c3e50",
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: "#bdc3c7",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e8f4fd",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  featureDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "400",
    lineHeight: 18,
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
