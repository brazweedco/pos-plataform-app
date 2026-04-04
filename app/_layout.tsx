import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import "react-native-reanimated";

import { FloatingCartButton } from "@/components/floating-cart-button";
import { ToastProvider } from "@/contexts/toast-context";
import { useAppFonts } from "@/hooks/use-appfonts";
import { useSession } from "@/hooks/use-session";
import { QueryProvider } from "@/providers/query-provider";
import { authService } from "@/services/auth";
import { useUserStore } from "@/stores/user-store";

// Stripe publishable key (use env var in production)
const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_51Qzhx8JARFVa1BeEd2s1ysBZgvcGte2vYJCXt5pa6GveTIMB9OdjX08LlAVvMMqFw1Ph1aj3bJUAY5Xe43vLdymN00QuEywLMK";

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

  // StripeProvider is only available on native platforms
  const content = (
    <QueryProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </QueryProvider>
  );

  // Wrap with StripeProvider on native platforms only
  if (Platform.OS === "web") {
    return content;
  }

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      urlScheme="brazweedpos"
      merchantIdentifier="merchant.com.brazweed.pos"
    >
      {content}
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
