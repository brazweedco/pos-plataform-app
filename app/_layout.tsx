import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import "react-native-reanimated";

import { FloatingCartButton } from "@/components/floating-cart-button";
import { ToastProvider } from "@/contexts/toast-context";
import { useAppFonts } from "@/hooks/use-appfonts";
import { useSession } from "@/hooks/use-session";
import { QueryProvider } from "@/providers/query-provider";
import { authService } from "@/services/auth";
import { useUserStore } from "@/stores/user-store";

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
        <Stack.Screen name="checkout" />
        <Stack.Screen name="checkout-success" />
      </Stack>
      <FloatingCartButton />
      <StatusBar style="dark" />
    </View>
  );
}

export default function RootLayout() {
  const { fontsLoaded, fontError } = useAppFonts();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  // Initialize auth on app load (handles browser refresh)
  useEffect(() => {
    const initAuth = async () => {
      // Skip if user is already in store (already initialized)
      if (user) {
        setIsAuthInitialized(true);
        return;
      }

      try {
        // Initialize auth from storage (restores tokens and tenant ID)
        const isAuthenticated = await authService.initialize();

        if (isAuthenticated) {
          // Restore user to store
          const storedUser = await authService.getUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsAuthInitialized(true);
      }
    };

    initAuth();
  }, [user, setUser]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isAuthInitialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isAuthInitialized]);

  // Don't render until fonts are loaded and auth is initialized
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!isAuthInitialized) {
    return null;
  }

  return (
    <QueryProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
