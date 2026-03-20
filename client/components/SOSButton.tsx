import * as Location from "expo-location";
import * as SMS from "expo-sms";
import * as SecureStore from "expo-secure-store";
import React from "react";
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export default function SOSButton() {
  const handleSOS = async () => {
    try {
      console.log("SOS clicked");

      // Location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Location permission denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
      
      const savedName = await SecureStore.getItemAsync('settings_name');
      const nameStr = savedName ? `This is ${savedName}. ` : "";
      const message = `EMERGENCY! ${nameStr}My location:\n${link}`;

      let phoneNumbers = ["919217672083"]; // fallback
      let primaryPhone = "919217672083";

      const savedContacts = await SecureStore.getItemAsync('settings_contacts');
      if (savedContacts) {
        try {
          const parsed = JSON.parse(savedContacts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            phoneNumbers = parsed.map((c: any) => c.phone.replace(/[^\d+]/g, ''));
            primaryPhone = parsed[0].phone.replace(/[^\d+]/g, '');
          }
        } catch (e) {
          console.error("Failed to parse contacts");
        }
      }

      // Check if SMS is available
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("SMS not available on this device");
        return;
      }

      await SMS.sendSMSAsync(phoneNumbers, message);

      // Call (opens dialer)
      Linking.openURL(`tel:${primaryPhone.replace(/\s+/g, '')}`);
    } catch (err) {
      console.log(err);
      Alert.alert("Error sending SOS");
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleSOS}>
      <Text style={styles.text}>SOS</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: "red",
    padding: 20,
    borderRadius: 50,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
  },
});
