import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { useScale } from "@/hooks/use-scale";
import { useCartStore } from "@/stores/cart-store";

// Screens where the cart button should be hidden
const HIDDEN_SCREENS = ["/cart", "/login", "/", "/checkout", "/checkout-success"];

// Screens that have bottom tab bar
const SCREENS_WITH_TAB_BAR = [
  "/home",
  "/products",
  "/inventory",
  "/orders",
  "/settings",
];

// Screens that have custom bottom content (like "Add to Cart" button)
const SCREENS_WITH_BOTTOM_CONTENT = ["/product/"];

export function FloatingCartButton() {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Subscribe directly to items array to ensure re-render on changes
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Hide on specific screens
  if (HIDDEN_SCREENS.includes(pathname)) {
    return null;
  }

  // Only show when there's at least 1 item
  if (totalItems === 0) {
    return null;
  }

  // Calculate bottom position based on screen type
  const getBottomPosition = () => {
    // Screens with tab bar need more space
    if (SCREENS_WITH_TAB_BAR.includes(pathname)) {
      return sy(96) + insets.bottom;
    }

    // Product detail has "Add to Cart" button at bottom
    if (SCREENS_WITH_BOTTOM_CONTENT.some((screen) => pathname.startsWith(screen))) {
      return sy(160) + insets.bottom;
    }

    // Default: just above safe area
    return sy(20) + insets.bottom;
  };

  return (
    <Pressable
      style={[
        styles.container,
        {
          width: s(56),
          height: s(56),
          borderRadius: s(28),
          bottom: getBottomPosition(),
          right: sx(20),
        },
      ]}
      onPress={() => router.push("/cart")}
    >
      <Feather name="shopping-cart" size={s(24)} color={COLORS.surface} />

      {/* Badge */}
      <View
        style={[
          styles.badge,
          {
            minWidth: s(20),
            height: s(20),
            borderRadius: s(10),
            top: -sy(4),
            right: -sx(4),
            paddingHorizontal: sx(6),
          },
        ]}
      >
        <Text style={[styles.badgeText, { fontSize: s(11) }]}>
          {totalItems > 99 ? "99+" : totalItems}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 15,
    elevation: 8,
    zIndex: 1000,
  },
  badge: {
    position: "absolute",
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: COLORS.surface,
    fontFamily: FONTS.semiBold,
  },
});
