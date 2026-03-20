import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      try {
        const token = SecureStore.getItem("session_token");
        setHasToken(!!token);
      } catch (e) {
        setHasToken(false);
      } finally {
        setIsReady(true);
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (hasToken) {
      router.replace("/(tabs)/map");
    }
  }, [isReady, hasToken]);

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" translucent={false} backgroundColor="#000000" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}