import { Platform, useWindowDimensions } from "react-native";

// Design base dimensions from Figma (mobile)
const DESIGN_WIDTH = 440;
const DESIGN_HEIGHT = 956;

// Web constraints
const MAX_MOBILE_WIDTH = 480;
const MAX_CONTENT_WIDTH = 440;

export function useScale() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // For web, limit the effective width to simulate mobile viewport
  const isWeb = Platform.OS === "web";
  const isLargeScreen = screenWidth > MAX_MOBILE_WIDTH;

  // Effective dimensions for scaling
  const effectiveWidth = isWeb && isLargeScreen ? MAX_CONTENT_WIDTH : screenWidth;
  const effectiveHeight = screenHeight;

  const scaleX = effectiveWidth / DESIGN_WIDTH;
  const scaleY = effectiveHeight / DESIGN_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  return {
    // Screen dimensions
    screenWidth,
    screenHeight,
    // Effective dimensions (constrained for web)
    width: effectiveWidth,
    height: effectiveHeight,
    // Scale factors
    scaleX,
    scaleY,
    scale,
    // Helpers
    sx: (size: number) => size * scaleX,
    sy: (size: number) => size * scaleY,
    s: (size: number) => size * scale,
    // Layout info
    isWeb,
    isLargeScreen,
    maxContentWidth: MAX_CONTENT_WIDTH,
  };
}
