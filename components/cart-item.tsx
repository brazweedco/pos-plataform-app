import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";
import { useCartStore } from "@/stores/cart-store";
import { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { s, sx, sy } = useScale();
  const { incrementQuantity, decrementQuantity, removeItem } = useCartStore();

  const { product, quantity } = item;
  const totalPrice = product.price * quantity;
  const weightDisplay = product.weightGrams
    ? `${product.weightGrams}g eq.`
    : null;

  return (
    <View
      style={[
        styles.container,
        {
          padding: s(12),
          borderRadius: s(12),
          marginBottom: sy(12),
        },
      ]}
    >
      {/* Product Image */}
      <Image
        source={{ uri: product.image }}
        style={[
          styles.image,
          {
            width: s(80),
            height: s(80),
            borderRadius: s(9),
          },
        ]}
        contentFit="cover"
      />

      {/* Product Info */}
      <View style={[styles.info, { marginLeft: sx(12) }]}>
        <View style={styles.header}>
          <Text
            style={[styles.name, { fontSize: s(FONT_SIZES.md) }]}
            numberOfLines={1}
          >
            {product.name}
          </Text>
          <Text style={[styles.price, { fontSize: s(FONT_SIZES.md), marginLeft: sx(8) }]}>
            ${totalPrice.toFixed(2)}
          </Text>
        </View>

        {weightDisplay && (
          <Text style={[styles.weight, { fontSize: s(FONT_SIZES.sm), marginTop: sy(2) }]}>
            {weightDisplay}
          </Text>
        )}

        {product.thcPercentage && (
          <View
            style={[
              styles.thcBadge,
              {
                paddingHorizontal: sx(10),
                paddingVertical: sy(4),
                borderRadius: s(12),
                marginTop: sy(6),
              },
            ]}
          >
            <Text style={[styles.thcText, { fontSize: s(10) }]}>
              {product.thcPercentage}% THC
            </Text>
          </View>
        )}

        {/* Quantity Controls */}
        <View style={[styles.quantityContainer, { marginTop: sy(8) }]}>
          <View
            style={[
              styles.quantityControls,
              {
                borderRadius: s(4),
                height: sy(36),
              },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.quantityButton,
                { width: s(36), opacity: pressed ? 0.6 : 1 },
              ]}
              onPress={() =>
                quantity === 1
                  ? removeItem(product.id)
                  : decrementQuantity(product.id)
              }
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel={quantity === 1 ? `Remove ${product.name} from cart` : `Decrease quantity of ${product.name}`}
            >
              <Feather
                name={quantity === 1 ? "trash-2" : "minus"}
                size={s(15)}
                color={quantity === 1 ? COLORS.error : COLORS.textMuted}
              />
            </Pressable>

            <Text style={[styles.quantity, { fontSize: s(FONT_SIZES.sm) }]}>
              {quantity}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.quantityButton,
                { width: s(36), opacity: pressed ? 0.6 : 1 },
              ]}
              onPress={() => incrementQuantity(product.id)}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel={`Increase quantity of ${product.name}`}
            >
              <Feather name="plus" size={s(15)} color={COLORS.primary} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(241, 112, 73, 0.25)",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
  },
  image: {
    backgroundColor: COLORS.inputBackground,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  price: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  weight: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  thcBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(241, 112, 73, 0.18)",
  },
  thcText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderWidth: 0.7,
    borderColor: COLORS.divider,
  },
  quantityButton: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
    minWidth: 28,
    textAlign: "center",
  },
});
