import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { BrazweedLogo } from "@/components/brazweed-logo";
import { ScreenContainer } from "@/components/screen-container";
import { authService } from "@/services/auth";
import { useUserStore } from "@/stores/user-store";

export default function SplashScreen() {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    logoScale.value = withTiming(1, { duration: 600 });
    logoOpacity.value = withTiming(1, { duration: 600 });

    const initAuth = async () => {
      // Initialize auth from storage (restores tokens and tenant ID)
      const isAuthenticated = await authService.initialize();

      if (isAuthenticated) {
        // Restore user to store
        const user = await authService.getUser();
        if (user) {
          setUser(user);
        }
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    };

    const timer = setTimeout(() => {
      initAuth();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Animated.View style={animatedLogoStyle}>
          <BrazweedLogo iconOnly />
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
