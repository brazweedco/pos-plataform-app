import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import "react-native-reanimated";

import { FloatingCartButton } from "@/components/floating-cart-button";
import { ToastProvider } from "@/contexts/toast-context";
import { useAppFonts } from "@/hooks/use-appfonts";
import { useSession } from "@/hooks/use-session";
import { QueryProvider } from "@/providers/query-provider";

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

function AppContent() {
  // Initialize session management (handles expired sessions)
  useSession();

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="home" />
        <Stack.Screen name="inventory" />
        <Stack.Screen name="products" />
        <Stack.Screen name="product-create" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="cart" />
      </Stack>
      <FloatingCartButton />
      <StatusBar style="dark" />
    </View>
  );
}

export default function RootLayout() {
  const { fontsLoaded, fontError } = useAppFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Don't render until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryProvider>
      <ToastProvider>
        <View style={styles.container}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="home" />
            <Stack.Screen name="inventory" />
            <Stack.Screen name="products" />
            <Stack.Screen name="product-create" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="product/[id]" />
          </Stack>
          <StatusBar style="dark" />
        </View>
      </ToastProvider>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
