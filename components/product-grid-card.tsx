import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";
import { Product } from "@/types/product";

interface ProductGridCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export function ProductGridCard({
  product,
  onPress,
  onAddToCart,
}: ProductGridCardProps) {
  const { s, sx, sy } = useScale();

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      onAddToCart?.(product);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          width: sx(195),
          height: sy(190),
          borderRadius: s(12),
          opacity: pressed ? 0.88 : 1,
        },
      ]}
      onPress={() => onPress?.(product)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, $${product.price.toFixed(2)}${isOutOfStock ? ", out of stock" : ""}`}
    >
      {/* Product Image */}
      <View
        style={[
          styles.imageContainer,
          {
            marginHorizontal: sx(9),
            marginTop: sy(9),
            height: sy(96),
            borderRadius: s(9),
          },
        ]}
      >
        <Image
          source={{ uri: product.image }}
          style={[styles.image, { borderRadius: s(9) }]}
          contentFit="cover"
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <View style={[styles.outOfStockOverlay, { borderRadius: s(9) }]}>
            <Text style={[styles.outOfStockText, { fontSize: s(FONT_SIZES.xs) }]}>
              Out of Stock
            </Text>
          </View>
        )}

        {/* THC Badge */}
        {!isOutOfStock && product.thcPercentage !== undefined && product.thcPercentage > 0 && (
          <View
            style={[
              styles.thcBadge,
              {
                borderRadius: s(12),
                paddingHorizontal: sx(12),
                paddingVertical: sy(5),
                top: sy(7),
                right: sx(7),
              },
            ]}
          >
            <Text style={[styles.thcText, { fontSize: s(FONT_SIZES.xs) }]}>
              {product.thcPercentage}% THC
            </Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View
        style={[
          styles.info,
          {
            paddingHorizontal: sx(9),
            paddingTop: sy(8),
            paddingBottom: sy(9),
          },
        ]}
      >
        <Text
          style={[styles.name, { fontSize: s(FONT_SIZES.sm) }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <Text
            style={[
              styles.price,
              { fontSize: s(FONT_SIZES.sm) },
              isOutOfStock && styles.priceDisabled,
            ]}
          >
            ${product.price.toFixed(2)}
          </Text>

          {/* Cart Button */}
          <Pressable
            style={({ pressed }) => [
              styles.cartButton,
              {
                width: s(32),
                height: s(32),
                borderRadius: s(16),
                opacity: isOutOfStock ? 0.35 : pressed ? 0.75 : 1,
              },
              isOutOfStock && styles.cartButtonDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={isOutOfStock}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name} to cart`}
            accessibilityState={{ disabled: isOutOfStock }}
          >
            <Feather name="shopping-cart" size={s(14)} color={COLORS.surface} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(241, 112, 73, 0.25)",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    overflow: "hidden",
    backgroundColor: COLORS.backgroundDark,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 47, 56, 0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    color: COLORS.surface,
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.3,
  },
  thcBadge: {
    position: "absolute",
    backgroundColor: "rgba(244, 244, 245, 0.24)",
  },
  thcText: {
    color: COLORS.surface,
    fontFamily: FONTS.medium,
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  priceDisabled: {
    color: COLORS.textMuted,
  },
  cartButton: {
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  cartButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
});
