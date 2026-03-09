import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { COLORS } from "@/constants/layout";
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
          height: sy(50),
          borderRadius: s(12),
          paddingHorizontal: sx(11),
        },
      ]}
    >
      <Feather
        name="search"
        size={s(22)}
        color={COLORS.textMuted}
        style={{ marginRight: sx(10) }}
      />
      <TextInput
        style={[styles.input, { fontSize: s(15) }]}
        placeholder={placeholder}
        placeholderTextColor="#71717B"
        value={value}
        onChangeText={onChangeText}
      />
      {showFilter && (
        <Pressable onPress={onFilterPress}>
          <Feather name="sliders" size={s(24)} color={COLORS.text} />
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
    shadowColor: "#CF4A22",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
  },
  input: {
    flex: 1,
    color: COLORS.text,
  },
});
