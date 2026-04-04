import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, rightAction }: ScreenHeaderProps) {
  const { s, sx, sy } = useScale();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingHorizontal: sx(20),
          paddingTop: sy(20),
          marginBottom: sy(22),
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          {
            width: s(44),
            height: s(44),
            borderRadius: s(22),
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <Feather name="chevron-left" size={s(24)} color={COLORS.text} />
      </Pressable>
      <Text style={[styles.title, { fontSize: s(FONT_SIZES.xl) }]}>{title}</Text>
      <View style={{ width: s(44) }}>
        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(241, 112, 73, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
});
