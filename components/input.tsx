import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { COLORS } from "@/constants/layout";
import { useScale } from "@/hooks/use-scale";

interface InputProps extends Omit<TextInputProps, "style"> {
  label: string;
  /** Show password toggle button */
  isPassword?: boolean;
}

export function Input({ label, isPassword = false, ...props }: InputProps) {
  const { s, sx, sy } = useScale();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ marginBottom: sy(12) }}>
      <Text style={[styles.label, { fontSize: s(15), marginBottom: sy(8) }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputContainer,
          {
            height: sy(50),
            borderRadius: s(12),
            paddingHorizontal: sx(11),
          },
          isFocused && styles.inputFocused,
        ]}
      >
        <TextInput
          style={[styles.input, { fontSize: s(14) }]}
          placeholderTextColor={COLORS.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={{ padding: s(8) }}
          >
            <Text style={{ fontSize: s(16) }}>
              {showPassword ? "👁" : "👁‍🗨"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: COLORS.text,
    fontWeight: "400",
  },
  inputContainer: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  inputFocused: {
    borderColor: COLORS.borderFocused,
  },
  input: {
    flex: 1,
    color: COLORS.text,
  },
});
