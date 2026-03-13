import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrazweedLogo } from "@/components/brazweed-logo";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { useToast } from "@/contexts/toast-context";
import { useScale } from "@/hooks/use-scale";
import { authService } from "@/services/auth";
import { useUserStore } from "@/stores/user-store";
import { getErrorMessage } from "@/utils/error-handler";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { s, sx, sy, isWeb, isLargeScreen } = useScale();
  const { showError, showWarning } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  // Adjust top margin for web large screens
  const topMargin = isWeb && isLargeScreen ? sy(180) : sy(221) + insets.top;

  const handleSignIn = async () => {
    if (!email || !password) {
      showWarning("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      console.log("Login successful:", response.user);
      setUser(response.user);
      router.replace("/home");
    } catch (error) {
      console.error("Login failed:", error);
      showError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = () => {
    console.log("Biometric auth");
  };

  return (
    <ScreenContainer avoidKeyboard scrollable>
      {/* Logo */}
      <View
        style={[
          styles.logoContainer,
          {
            marginTop: topMargin,
            height: sy(61),
          },
        ]}
      >
        <BrazweedLogo />
      </View>

      {/* Login Card */}
      <View
        style={[
          styles.card,
          {
            marginTop: sy(45),
            marginHorizontal: sx(20),
            paddingHorizontal: sx(23),
            paddingTop: sy(24),
            paddingBottom: sy(27),
            borderRadius: s(12),
          },
        ]}
      >
        <Input
          label="Email"
          placeholder="Your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCorrect={false}
          editable={!isLoading}
        />

        <Input
          label="Password"
          placeholder="***********"
          value={password}
          onChangeText={setPassword}
          isPassword
          editable={!isLoading}
        />

        <View style={{ marginTop: sy(4) }}>
          <Button
            title={isLoading ? "Signing in..." : "Sign In"}
            onPress={handleSignIn}
            disabled={isLoading}
          />
        </View>
      </View>

      {/* Divider */}
      <View
        style={[
          styles.dividerContainer,
          {
            marginTop: sy(39),
            marginHorizontal: sx(20),
          },
        ]}
      >
        <View style={[styles.dividerLine, { width: sx(127) }]} />
        <Text
          style={[
            styles.dividerText,
            {
              fontSize: s(16),
              marginHorizontal: sx(12),
            },
          ]}
        >
          Or continue with
        </Text>
        <View style={[styles.dividerLine, { width: sx(127) }]} />
      </View>

      {/* Biometric Button */}
      <View
        style={{
          marginTop: sy(40),
          marginHorizontal: sx(43),
        }}
      >
        <Button
          title="Face ID / Touch ID"
          variant="secondary"
          icon={require("@/assets/images/fingerprint-icon.svg")}
          onPress={handleBiometricAuth}
          disabled={isLoading}
        />
      </View>

      {/* Footer */}
      <View
        style={[
          styles.footerContainer,
          { paddingBottom: isWeb ? sy(40) : insets.bottom + 20 },
        ]}
      >
        <Text style={[styles.footerText, { fontSize: s(16) }]}>
          Having trouble?{" "}
          <Text style={styles.footerLink}>Contact your manager</Text>
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dividerLine: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    color: COLORS.textLight,
    fontFamily: FONTS.regular,
  },
  footerContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    minHeight: 100,
  },
  footerText: {
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  footerLink: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    textDecorationLine: "underline",
  },
});
