import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { BrazweedLogo } from "@/components/brazweed-logo";
import { ScreenContainer } from "@/components/screen-container";
import { useUserStore } from "@/stores/user-store";

export default function SplashScreen() {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);

  const navigateToNextScreen = () => {
    const currentUser = useUserStore.getState().user;
    if (currentUser) {
      router.replace("/home");
    } else {
      router.replace("/login");
    }
  };

  useEffect(() => {
    // Animate logo and navigate when animation completes
    logoScale.value = withTiming(1, { duration: 800 });
    logoOpacity.value = withTiming(1, { duration: 800 }, (finished) => {
      if (finished) {
        runOnJS(navigateToNextScreen)();
      }
    });
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
