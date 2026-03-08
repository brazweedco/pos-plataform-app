import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { useScale } from "@/hooks/use-scale";

interface BrazweedLogoProps {
  /** Show only the icon without text */
  iconOnly?: boolean;
}

export function BrazweedLogo({ iconOnly = false }: BrazweedLogoProps) {
  const { s, sx, sy } = useScale();

  if (iconOnly) {
    return (
      <Image
        source={require("@/assets/images/brazweed-logo.svg")}
        style={{
          width: s(98),
          height: s(98),
        }}
        contentFit="contain"
      />
    );
  }

  return (
    <View style={[styles.container, { gap: sx(12) }]}>
      <Image
        source={require("@/assets/images/brazweed-logo.svg")}
        style={{
          width: s(57.5),
          height: s(61.4),
        }}
        contentFit="contain"
      />
      <Image
        source={require("@/assets/images/brazweed-logo-text.svg")}
        style={{
          width: sx(187),
          height: sy(29),
        }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
