import { useFonts } from "expo-font";

/**
 * Custom hook to load Foundry Context fonts
 *
 * Returns:
 * - fontsLoaded: boolean indicating if fonts are ready
 * - fontError: error if font loading failed
 */
export function useAppFonts() {
  const [fontsLoaded, fontError] = useFonts({
    "FoundryContextW03-Regular": require("@/assets/fonts/foundry-context-w03-regular.ttf"),
    "FoundryContextW03-Demi": require("@/assets/fonts/foundry-context-w03-demi.ttf"),
    "FoundryContextW03-Bold": require("@/assets/fonts/foundry-context-w03-x-bd.ttf"),
    "FoundryContextW03-ExtraBold": require("@/assets/fonts/foundry-context-w03-xb-bd.ttf"),
  });

  return { fontsLoaded, fontError };
}
