import {
  StyleSheet,
  View,
  Animated,
  Easing,
  Dimensions,
  Keyboard,
  Platform,
  Image,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import FieldInput from "@/components/ui/FieldInput";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store"

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const slideAnim = useRef(new Animated.Value(300)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const getBaseUrl = () => {
    if (Platform.OS === "android") return "http://192.168.1.41:8080";
    if (Platform.OS === "ios") return "http://localhost:8080";
    return "http://localhost:8080"; // web + physical device
  };
 
  useEffect(() => {
    router.push("/(tabs)/map")
  }, []);

  const handleButtonPress = async () => {
    const credentials = { email, password };

    try {
      const BASE_URL = "http://localhost:8080";
      const response = await axios.post(`${BASE_URL}/auth/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      });
      const rawString = typeof response.data === "string" ? response.data : JSON.stringify(response.data);

      // Extract just the JSON object part taking out the response body part from the response string excluding escape characters
      const jsonMatch = rawString.match(/\{.*\}/s);
      if (!jsonMatch) {
        console.log("Could not extract JSON from response");
        return;
      }

      const data = JSON.parse(jsonMatch[0]);

      SecureStore.setItem("session_token", data.token)

      router.replace("/(tabs)/map");
      if (1 == 1) {
        console.log("Navigating to map...");
      }else {
        Alert.alert("Warning", "email or password invalid")
      }

    } catch (error: any) {
      console.log("Login error status:", error);
      console.log("Login error data:", JSON.stringify(error?.response?.data));
    }
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 700,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: -e.endCoordinates.height,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Upper black area with logo */}
      <Animated.View
        style={[
          styles.upperViewContainer,
          {
            transform: [
              { translateY: slideAnim },
              { translateY: keyboardOffset },
            ],
          },
        ]}
      >
        <Image
          source={require("@/assets/images/SAFE_HER.png")}
          style={{ width: 300, height: 300 }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Lower yellow card */}
      <Animated.View
        style={[
          styles.lowerViewContainer,
          {
            transform: [
              { translateY: slideAnim },
              { translateY: keyboardOffset },
            ],
          },
        ]}
      >
        <FieldInput
          placeholder="Enter your email"
          type="email-address"
          onChangeText={(newText) => setEmail(newText)}
          value={email}
        />
        <FieldInput
          placeholder="Enter your password"
          type="password"
          onChangeText={(newText) => setPassword(newText)}
          value={password}
        />

        <TouchableOpacity
          onPress={handleButtonPress}
          style={styles.loginBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>

        {/* Add below the login button */}
        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={styles.registerBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.registerBtnText}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  upperViewContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },

  lowerViewContainer: {
    backgroundColor: "#fad047",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT * 0.32,
  },

  loginBtn: {
    backgroundColor: "#000",
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  loginBtnText: {
    color: "#fad047",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  registerBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#000",
  },

  registerBtnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});
