import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Vibration,
  Platform,
  AppState,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const AlarmPopup = ({ 
  isVisible, 
  alarmSound, 
  onStop, 
  onSnooze, 
  onClose 
}) => {
  const { t } = useTranslation();
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [vibrationInterval, setVibrationInterval] = useState(null);

  // Monitor app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      console.log('AlarmPopup: App state changed from', appState, 'to', nextAppState);
      setAppState(nextAppState);
      
      // If app becomes active and alarm is playing, ensure audio continues
      if (nextAppState === 'active' && isVisible && !isPlaying) {
        playAlarmSound();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState, isVisible, isPlaying]);

  // Start vibration when alarm popup appears
  useEffect(() => {
    if (isVisible) {
      startVibration();
      playAlarmSound();
      
      // Show alert to ensure user sees the alarm
      if (Platform.OS === 'ios') {
        Alert.alert(
          t('wakeUp'),
          t('alarmRinging'),
          [
            {
              text: t('snooze'),
              onPress: handleSnooze,
              style: 'default',
            },
            {
              text: t('stopAlarm'),
              onPress: handleStop,
              style: 'destructive',
            },
          ],
          { cancelable: false }
        );
      }
    } else {
      stopVibration();
      stopAlarmSound();
    }

    return () => {
      stopVibration();
      stopAlarmSound();
    };
  }, [isVisible]);

  const startVibration = () => {
    if (Platform.OS === 'ios') {
      // iOS vibration pattern: vibrate every 2 seconds
      const interval = setInterval(() => {
        Vibration.vibrate(1000);
      }, 2000);
      
      setVibrationInterval(interval);
    } else {
      // Android: continuous vibration
      Vibration.vibrate([0, 1000, 500, 1000], true);
    }
  };

  const stopVibration = () => {
    if (vibrationInterval) {
      clearInterval(vibrationInterval);
      setVibrationInterval(null);
    }
    Vibration.cancel();
  };

  const playAlarmSound = async () => {
    try {
      if (!alarmSound?.path) return;

      // Configure audio for alarm playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Create and play the alarm sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        alarmSound.path,
        {
          shouldPlay: true,
          isLooping: true,
          volume: 1.0,
        }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Set up sound status monitoring
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying) {
          setIsPlaying(false);
        }
      });

    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  };

  const stopAlarmSound = async () => {
    try {
      if (sound) {
        // Check if sound is loaded before trying to stop it
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await sound.stopAsync();
          }
          await sound.unloadAsync();
        }
        setSound(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error stopping alarm sound:', error);
      // Reset state even if there's an error
      setSound(null);
      setIsPlaying(false);
    }
  };

  const handleStop = async () => {
    await stopAlarmSound();
    stopVibration();
    onStop();
  };

  const handleSnooze = async () => {
    await stopAlarmSound();
    stopVibration();
    onSnooze();
  };

  const handleClose = async () => {
    await stopAlarmSound();
    stopVibration();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Background with pulsing effect */}
        <View style={[styles.background, isPlaying && styles.pulsingBackground]} />
        
        {/* Main content */}
        <View style={styles.content}>
          <Text style={styles.title}>{t('wakeUp')} ⏰</Text>
          
          <Text style={styles.subtitle}>
            {alarmSound?.name || t('alarmRinging')}
          </Text>
          
          <Text style={styles.time}>
            {new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.snoozeButton]}
              onPress={handleSnooze}
              activeOpacity={0.8}
            >
              <Text style={styles.snoozeButtonText}>
                {t('snooze')} (5min)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStop}
              activeOpacity={0.8}
            >
              <Text style={styles.stopButtonText}>
                {t('stopAlarm')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <Text style={styles.instructions}>
            {t('swipeToDismiss')}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
  },
  pulsingBackground: {
    backgroundColor: '#2a2a2a',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 50,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
    marginBottom: 40,
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  snoozeButton: {
    backgroundColor: '#4a90e2',
  },
  snoozeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default AlarmPopup;
