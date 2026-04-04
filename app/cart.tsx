import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { CartItem } from "@/components/cart-item";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/ui";
import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES, TEXT_SIZES } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";
import { useCartStore } from "@/stores/cart-store";
import { LEGAL_LIMIT_GRAMS } from "@/types/cart";

export default function CartScreen() {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotal = useCartStore((state) => state.getTotal);
  const getTotalWeight = useCartStore((state) => state.getTotalWeight);
  const getLegalLimitPercentage = useCartStore(
    (state) => state.getLegalLimitPercentage
  );

  const subtotal = getSubtotal();
  const total = getTotal();
  const totalWeight = getTotalWeight();
  const legalPercentage = getLegalLimitPercentage();

  const handleCheckout = () => {
    // TODO: Implement checkout
    router.push("/checkout");
  };

  const renderEmptyCart = () => (
    <View style={[styles.emptyContainer, { paddingHorizontal: sx(40), paddingBottom: sy(60) }]}>
      {/* Empty Cart Icon */}
      <View
        style={[
          styles.emptyIconContainer,
          {
            width: s(120),
            height: s(120),
            borderRadius: s(60),
            marginBottom: sy(24),
          },
        ]}
      >
        <Feather name="shopping-cart" size={s(48)} color={COLORS.primary} />
      </View>

      {/* Empty State Text */}
      <Text style={[styles.emptyTitle, { fontSize: s(TEXT_SIZES.emptyTitle) }]}>
        Your cart is empty
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          { fontSize: s(TEXT_SIZES.emptySubtitle), marginTop: sy(8), maxWidth: sx(280) },
        ]}
      >
        Your cart is waiting. Browse products to get started.
      </Text>

      {/* Browse Button */}
      <View style={{ marginTop: sy(32), width: "100%" }}>
        <Button title="Browse Products" onPress={() => router.push("/products")} />
      </View>
    </View>
  );

  return (
    <ScreenContainer showPattern={false}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.headerContainer, { paddingBottom: sy(20) }]}>
          <ScreenHeader title="Current Cart" />

          {/* Legal Limit Bar - always show when there are items */}
          {items.length > 0 && (
            <View style={[styles.legalLimitContainer, { marginTop: sy(8), paddingHorizontal: sx(20) }]}>
              <View style={styles.legalLimitHeader}>
                <Text style={[styles.legalLimitLabel, { fontSize: s(TEXT_SIZES.body) }]}>
                  Legal Limit
                </Text>
                <Text style={[styles.legalLimitValue, { fontSize: s(TEXT_SIZES.body) }]}>
                  {totalWeight.toFixed(1)}g / {LEGAL_LIMIT_GRAMS}g
                </Text>
              </View>
              <View
                style={[
                  styles.progressBar,
                  { height: sy(8), borderRadius: s(10), marginTop: sy(8) },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${legalPercentage}%`,
                      borderRadius: s(10),
                      backgroundColor:
                        legalPercentage >= 100 ? COLORS.error : COLORS.primary,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Cart Items */}
        {items.length === 0 ? (
          renderEmptyCart()
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.product.id}
            renderItem={({ item }) => <CartItem item={item} />}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingHorizontal: sx(20),
                paddingTop: sy(20),
                paddingBottom: sy(220),
              },
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Summary Footer */}
        {items.length > 0 && (
          <View
            style={[
              styles.footer,
              {
                paddingHorizontal: sx(16),
                paddingTop: sy(16),
                paddingBottom: Math.max(insets.bottom, sy(16)) + sy(8),
                borderRadius: s(12),
              },
            ]}
          >
            {/* Subtotal */}
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { fontSize: s(FONT_SIZES.sm) }]}>
                Subtotal
              </Text>
              <Text style={[styles.summaryValue, { fontSize: s(FONT_SIZES.sm) }]}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { marginVertical: sy(16) }]} />

            {/* Total */}
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { fontSize: s(TEXT_SIZES.totalAmount) }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { fontSize: s(TEXT_SIZES.totalAmount) }]}>
                ${total.toFixed(2)}
              </Text>
            </View>

            {/* Checkout Button */}
            <View style={{ marginTop: sy(17) }}>
              <Button title="Go to Checkout" onPress={handleCheckout} />
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 8,
  },
  legalLimitContainer: {},
  legalLimitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legalLimitLabel: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  legalLimitValue: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  progressBar: {
    backgroundColor: COLORS.backgroundDark,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIconContainer: {
    backgroundColor: "rgba(228, 108, 69, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
    textAlign: "center",
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    textAlign: "center",
    lineHeight: 22,
  },
  listContent: {},
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
  summaryValue: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  totalLabel: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  totalValue: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});
