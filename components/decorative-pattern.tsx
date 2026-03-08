import { Image } from "expo-image";
import { StyleSheet } from "react-native";

import { useScale } from "@/hooks/use-scale";

export function DecorativePattern() {
  const { sx, sy, isWeb, isLargeScreen, maxContentWidth, screenWidth } = useScale();

  // For web large screens, calculate position based on the mobile frame width
  const patternLeft = isWeb && isLargeScreen
    ? (maxContentWidth * 245) / 440
    : sx(245);

  return (
    <Image
      source={require("@/assets/images/brazweed-pattern.svg")}
      style={[
        styles.pattern,
        {
          top: sy(-84),
          left: patternLeft,
          width: sx(286),
          height: sy(305),
        },
      ]}
      contentFit="contain"
    />
  );
}

const styles = StyleSheet.create({
  pattern: {
    position: "absolute",
  },
});
