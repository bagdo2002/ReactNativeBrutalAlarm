import React, { useState } from "react";
import { View } from "react-native";
import SplashScreen1 from "./SplashScreen1";
import SplashScreen2 from "./SplashScreen2";
import SplashScreen3 from "./SplashScreen3";

export default function FeaturesSplashScreen({ onAnimationFinish, onNext }) {
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen < 2) {
      setCurrentScreen(currentScreen + 1);
    } else {
      if (onNext) {
        onNext();
      }
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 0:
        return <SplashScreen1 onNext={handleNext} />;
      case 1:
        return <SplashScreen2 onNext={handleNext} />;
      case 2:
        return <SplashScreen3 onNext={handleNext} />;
      default:
        return <SplashScreen1 onNext={handleNext} />;
    }
  };

  return <View style={{ flex: 1 }}>{renderCurrentScreen()}</View>;
}

