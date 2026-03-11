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
import { FONTS } from "@/constants/fonts";
import { useScale } from "@/hooks/use-scale";

interface InputProps extends Omit<TextInputProps, "style"> {
  label: string;
  /** Show password toggle button */
  isPassword?: boolean;
}

export function Input({ label, isPassword = false, multiline, ...props }: InputProps) {
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
            minHeight: sy(50),
            height: multiline ? undefined : sy(50),
            borderRadius: s(12),
            paddingHorizontal: sx(11),
            paddingVertical: multiline ? sy(11) : 0,
            alignItems: multiline ? "flex-start" : "center",
          },
          isFocused && styles.inputFocused,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { fontSize: s(14) },
            multiline && { minHeight: sy(80), textAlignVertical: "top" },
          ]}
          placeholderTextColor={COLORS.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          multiline={multiline}
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
    fontFamily: FONTS.regular,
  },
  inputContainer: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
  },
  inputFocused: {
    borderColor: COLORS.borderFocused,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
});
