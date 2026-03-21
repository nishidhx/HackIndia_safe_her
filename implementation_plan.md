# Voice Detection Implementation Plan

To enable true Voice-Activated SOS (Live Speech-to-Text), we must integrate a native audio transcribing library. Since the standard "Expo Go" scanning app does not map live microphone transcription natively over the air, we will construct and configure the native `@react-native-voice/voice` module.

## Proposed Logic
1. **Dependencies**: 
   - I will run `npm install @react-native-voice/voice expo-build-properties` directly into your client folder.
2. **Permissions ([app.json](file:///c:/Users/itz_n/OneDrive/Desktop/hackindia_safe_her/HackIndia_safe_her/client/app.json))**:
   - Programmatically configure the Android Manifest to request `RECORD_AUDIO` permissions (required for Native Google Speech-to-Text).
   - Configure the `@react-native-voice/voice` Expo plugins natively.
3. **Global Listener Hook ([_layout.tsx](file:///c:/Users/itz_n/OneDrive/Desktop/hackindia_safe_her/HackIndia_safe_her/client/app/_layout.tsx))**:
   - I will create a global background listener that mounts onto the Root Layout when the app initially opens.
   - It will ask the user for Microphone permissions upon booting.
   - It will continuously listen to the microphone in `partialResults` node. 
   - Every time it hears text, it will cross-reference it with the `settings_sos_keyword` saved in SecureStore (e.g., `"Help SafeHer"`).
   - If it detects a match, it immediately visually shifts the app into an SOS State (exactly like pressing the Red SOS Button).
   - *Technical Hackathon Workaround:* Since Android aggressively stops voice-recognition after a few seconds of silence, my code will automatically restart the `Voice.start('en-US')` listener immediately upon any timeouts or audio-stops, simulating an "always-on" Alexa/Siri-style background agent in the foreground.

## User Review Required
> [!WARNING]
> Because `@react-native-voice/voice` connects directly to Native Android Java protocols... **the Expo Go app on your phone will completely crash if you try to rapidly hot-reload it!**
> 
> **CRITICAL:** After I finish writing this code, you **MUST** physically shut down your current server and type `npx expo run:android` in your computer's terminal to compile the new native Java libraries into a Custom Dev App onto your phone!
>
> Please confirm if you are willing to run the native build command. If you agree, I will start installing the packages and writing the AI triggers immediately!
