import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { EyeClosed } from "@/components/icons/eye-closed-icon";
import { EyeOpen } from "@/components/icons/eye-open-icon";
import { FONTS } from "@/constants/fonts";
import { COLORS } from "@/constants/layout";
import { FONT_SIZES, INPUT_HEIGHT } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";
export { EyeClosed, EyeOpen };

interface InputProps extends Omit<TextInputProps, "style"> {
  label: string;
  isPassword?: boolean;
  error?: string;
}

export function Input({
  label,
  isPassword = false,
  multiline,
  error,
  ...props
}: InputProps) {
  const { s, sx, sy } = useScale();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={{ marginBottom: sy(14) }}>
      <Text style={[styles.label, { fontSize: s(FONT_SIZES.md), marginBottom: sy(10) }]}>
        {label}
      </Text>
      <Pressable
        onPress={handleContainerPress}
        style={[
          styles.inputContainer,
          {
            minHeight: sy(INPUT_HEIGHT),
            height: multiline ? undefined : sy(INPUT_HEIGHT),
            borderRadius: s(12),
            paddingHorizontal: sx(16),
            paddingVertical: multiline ? sy(14) : 0,
            alignItems: multiline ? "flex-start" : "center",
          },
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { fontSize: s(FONT_SIZES.md), paddingVertical: sy(14) },
            multiline && { minHeight: sy(100), textAlignVertical: "top" },
          ]}
          placeholderTextColor={COLORS.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          multiline={multiline}
          accessibilityLabel={label}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={({ pressed }) => [{ padding: s(12), opacity: pressed ? 0.6 : 1 }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOpen color={COLORS.primary} size={s(20)} />
            ) : (
              <EyeClosed color={COLORS.primary} size={s(20)} />
            )}
          </Pressable>
        )}
      </Pressable>
      {error && (
        <Text style={[styles.errorText, { fontSize: s(FONT_SIZES.sm), marginTop: sy(6) }]}>
          {error}
        </Text>
      )}
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
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONTS.regular,
  },
});
