import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StoreProvider, useStore } from "../state/store";
import { color, fontFiles } from "../theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function Gate() {
  const [fontsLoaded] = useFonts(fontFiles);
  const { ready } = useStore();
  const show = fontsLoaded && ready;
  useEffect(() => {
    if (show) SplashScreen.hideAsync().catch(() => {});
  }, [show]);
  if (!show) return null;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.skyTop } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="session" options={{ gestureEnabled: false }} />
      <Stack.Screen name="done" options={{ gestureEnabled: false, animation: "fade" }} />
      <Stack.Screen name="skill/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Gate />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
