import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { useScale } from "@/hooks/use-scale";

import { DecorativePattern } from "./decorative-pattern";

interface ScreenContainerProps {
  children: ReactNode;
  /** Show decorative pattern in top right */
  showPattern?: boolean;
  /** Use KeyboardAvoidingView for screens with inputs */
  avoidKeyboard?: boolean;
  /** Enable scrolling */
  scrollable?: boolean;
}

export function ScreenContainer({
  children,
  showPattern = true,
  avoidKeyboard = false,
  scrollable = false,
}: ScreenContainerProps) {
  const { isWeb, isLargeScreen, screenWidth, maxContentWidth } = useScale();

  const content = (
    <>
      {showPattern && <DecorativePattern />}
      {children}
    </>
  );

  const innerContent = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  ) : (
    content
  );

  // Wrapper for keyboard avoiding
  const keyboardContent = avoidKeyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {innerContent}
    </KeyboardAvoidingView>
  ) : (
    innerContent
  );

  // For web on large screens, center the content
  if (isWeb && isLargeScreen) {
    return (
      <View style={styles.webContainer}>
        <View
          style={[
            styles.mobileFrame,
            {
              width: maxContentWidth,
              maxWidth: maxContentWidth,
            },
          ]}
        >
          {keyboardContent}
        </View>
      </View>
    );
  }

  return <View style={styles.container}>{keyboardContent}</View>;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FEF9F3",
  },
  webContainer: {
    flex: 1,
    backgroundColor: "#E8E0D8",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileFrame: {
    flex: 1,
    backgroundColor: "#FEF9F3",
    overflow: "hidden",
    // Shadow for the mobile frame on web
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: 956,
    borderRadius: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
