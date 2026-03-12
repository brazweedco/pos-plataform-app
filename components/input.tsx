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
import { useScale } from "@/hooks/use-scale";
export { EyeClosed, EyeOpen };

interface InputProps extends Omit<TextInputProps, "style"> {
  label: string;
  isPassword?: boolean;
}

export function Input({
  label,
  isPassword = false,
  multiline,
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
    <View style={{ marginBottom: sy(12) }}>
      <Text style={[styles.label, { fontSize: s(15), marginBottom: sy(8) }]}>
        {label}
      </Text>
      <Pressable
        onPress={handleContainerPress}
        style={[
          styles.inputContainer,
          {
            minHeight: sy(50),
            height: multiline ? undefined : sy(50),
            borderRadius: s(12),
            paddingHorizontal: sx(14),
            paddingVertical: multiline ? sy(11) : 0,
            alignItems: multiline ? "flex-start" : "center",
          },
          isFocused && styles.inputFocused,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { fontSize: s(14), paddingVertical: sy(12) },
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
            style={{ padding: s(12) }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOpen color={COLORS.primary} size={s(20)} />
            ) : (
              <EyeClosed color={COLORS.primary} size={s(20)} />
            )}
          </Pressable>
        )}
      </Pressable>
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
