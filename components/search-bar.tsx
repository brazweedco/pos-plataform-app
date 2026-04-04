import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES, SEARCH_HEIGHT } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  showFilter?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onFilterPress,
  showFilter = true,
}: SearchBarProps) {
  const { s, sx, sy } = useScale();

  return (
    <View
      style={[
        styles.container,
        {
          height: sy(SEARCH_HEIGHT),
          borderRadius: s(12),
          paddingHorizontal: sx(14),
        },
      ]}
    >
      <Feather
        name="search"
        size={s(22)}
        color={COLORS.primary}
        style={{ marginRight: sx(10) }}
      />
      <TextInput
        style={[styles.input, { fontSize: s(FONT_SIZES.md) }]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
      {showFilter && (
        <Pressable onPress={onFilterPress}>
          <Feather name="sliders" size={s(24)} color={COLORS.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(241, 112, 73, 0.25)",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
});
