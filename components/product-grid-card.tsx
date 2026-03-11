import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/layout";
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

  const handleAddToCart = () => {
    onAddToCart?.(product);
  };

  return (
    <Pressable
      style={[
        styles.container,
        {
          width: sx(195),
          height: sy(200),
          borderRadius: s(12),
        },
      ]}
      onPress={() => onPress?.(product)}
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

        {/* THC Badge */}
        {product.thcPercentage !== undefined && product.thcPercentage > 0 && (
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
            <Text style={[styles.thcText, { fontSize: s(10) }]}>
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
            paddingTop: sy(6),
            paddingBottom: sy(7),
          },
        ]}
      >
        <Text
          style={[styles.name, { fontSize: s(15), lineHeight: s(18) }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product.name}
        </Text>

        <View style={[styles.priceRow, { marginTop: sy(4) }]}>
          <Text style={[styles.price, { fontSize: s(15) }]}>
            ${product.price.toFixed(2)}
          </Text>

          {/* Cart Button */}
          <Pressable
            style={[
              styles.cartButton,
              {
                width: s(30),
                height: s(30),
                borderRadius: s(15),
              },
            ]}
            onPress={handleAddToCart}
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
    shadowColor: "#CF4A22",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
  },
  imageContainer: {
    overflow: "hidden",
    backgroundColor: "#E0E0E0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  thcBadge: {
    position: "absolute",
    backgroundColor: "rgba(244, 244, 245, 0.24)",
  },
  thcText: {
    color: COLORS.surface,
    fontWeight: "500",
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    color: COLORS.text,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  cartButton: {
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
