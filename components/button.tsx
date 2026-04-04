import { Image, ImageSource } from "expo-image";
import { ReactNode } from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES, BUTTON_HEIGHT } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: ButtonVariant;
  /** Icon image source (for expo-image) */
  icon?: ImageSource;
  /** Custom icon component (ActivityIndicator, etc.) */
  iconComponent?: ReactNode;
  /** Disable the button */
  disabled?: boolean;
}

export function Button({
  title,
  variant = "primary",
  icon,
  iconComponent,
  disabled,
  ...props
}: ButtonProps) {
  const { s, sx, sy } = useScale();

  const isPrimary = variant === "primary";

  const renderIcon = () => {
    // Custom component takes priority
    if (iconComponent) {
      return iconComponent;
    }

    // Image icon
    if (icon) {
      return (
        <View
          style={[
            styles.iconContainer,
            {
              width: s(28),
              height: s(28),
              borderRadius: s(7),
            },
          ]}
        >
          <Image
            source={icon}
            style={{
              width: s(20),
              height: s(20),
            }}
            contentFit="contain"
          />
        </View>
      );
    }

    return null;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        {
          height: sy(BUTTON_HEIGHT),
          borderRadius: s(14),
          gap: sx(12),
          opacity: pressed && !disabled ? 0.82 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        disabled && styles.disabled,
      ]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      {...props}
    >
      {renderIcon()}
      <Text style={[styles.buttonText, { fontSize: s(FONT_SIZES.lg) }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 15,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: COLORS.surface,
    fontFamily: FONTS.semiBold,
  },
  iconContainer: {
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
});
