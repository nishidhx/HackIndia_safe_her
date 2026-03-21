import React, { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus, Alert, Platform } from 'react-native';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function VoiceListener() {
  const router = useRouter();
  const [keyword, setKeyword] = useState<string>("help safeher");
  const isListening = useRef(false);

  useEffect(() => {
    // Load the keyword continuously
    const loadKeyword = async () => {
      try {
        const saved = await SecureStore.getItemAsync("settings_sos_keyword");
        if (saved) {
          setKeyword(saved.toLowerCase().trim());
        } else {
          setKeyword("help safeher");
        }
      } catch (e) {
        console.log("Error loading keyword", e);
      }
    };
    loadKeyword();
    
    // Periodically re-check the keyword in case it changes in Settings
    const interval = setInterval(loadKeyword, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechResults;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;

    startListening();

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      subscription.remove();
    };
  }, [keyword]); // re-bind listeners when keyword changes safely

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = async () => {
    if (isListening.current) return;
    try {
      isListening.current = true;
      await Voice.start('en-US');
    } catch (e: any) {
      isListening.current = false;
      if (e?.message?.includes('startSpeech')) {
        console.warn("⚠️ REACT NATIVE NATIVE MODULE MISSING ⚠️");
        console.warn("You are using 'Expo Go'. Voice Recognition requires Native Java compilation (npx expo run:android).");
      } else {
        console.log("Voice start error: ", e);
      }
    }
  };

  const stopListening = async () => {
    try {
      isListening.current = false;
      await Voice.stop();
    } catch (e: any) {
      if (!e?.message?.includes('stopSpeech')) {
        console.log("Voice stop error: ", e);
      }
    }
  };

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value) {
      const spoken = e.value.join(" ").toLowerCase();
      const target = keyword.toLowerCase();
      
      console.log("Voice heard:", spoken, "| Looking for:", target);

      if (spoken.includes(target)) {
        triggerSOS();
      }
    }
  };

  const onSpeechEnd = () => {
    isListening.current = false;
    // Auto restart listening after a brief pause
    setTimeout(() => {
      startListening();
    }, 500);
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    isListening.current = false;
    // Error 7 is 'No match', meaning it timed out. Restart immediately.
    setTimeout(() => {
      startListening();
    }, 500);
  };

  const triggerSOS = async () => {
    // Stop listening momentarily while SOS executes
    stopListening();
    
    Alert.alert(
      "VOICE SOS TRIGGERED",
      `System heard your voice command: "${keyword}"\n\nInitiating Emergency Protocol!`,
      [{ text: "DISMISS", onPress: () => startListening() }]
    );
    
    // In actual implementation, we'd navigate to Map and fire API incidents
    // router.push("/(tabs)/map");
  };

  return null; // Invisible global listener
}
