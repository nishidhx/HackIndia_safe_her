import * as Location from "expo-location";
import * as SMS from "expo-sms";
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
      const message = `EMERGENCY!\nMy location:\n${link}`;

      // Check if SMS is available
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("SMS not available on this device");
        return;
      }

      await SMS.sendSMSAsync(["919217672083"], message);

      // Call (opens dialer)
      Linking.openURL("tel:919217672083");
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
