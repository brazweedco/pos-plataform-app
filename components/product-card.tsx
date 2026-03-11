import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { useScale } from "@/hooks/use-scale";
import { getStockStatus, Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const { s, sx, sy } = useScale();
  const stockStatus = getStockStatus(product.stock);

  return (
    <Pressable
      style={[
        styles.container,
        {
          borderRadius: s(12),
          padding: sx(12),
        },
      ]}
      onPress={() => onPress?.(product)}
    >
      {/* Product Image */}
      <Image
        source={{ uri: product.image }}
        style={[
          styles.image,
          {
            width: sx(138),
            height: sy(73),
            borderRadius: s(9),
          },
        ]}
        contentFit="cover"
      />

      {/* Product Info */}
      <View style={[styles.info, { marginLeft: sx(12) }]}>
        {/* Name and Price Row */}
        <View style={styles.header}>
          <Text
            style={[styles.name, { fontSize: s(17) }]}
            numberOfLines={1}
          >
            {product.name}
          </Text>
          <Text style={[styles.price, { fontSize: s(17) }]}>
            ${product.price.toFixed(2)}
          </Text>
        </View>

        {/* SKU */}
        <Text
          style={[
            styles.sku,
            { fontSize: s(14), marginTop: sy(4) },
          ]}
        >
          SKU: {product.sku}
        </Text>

        {/* Category Badge and Stock Status */}
        <View style={[styles.footer, { marginTop: sy(8) }]}>
          <View
            style={[
              styles.categoryBadge,
              {
                borderRadius: s(12),
                paddingHorizontal: sx(25),
                paddingVertical: sy(5),
              },
            ]}
          >
            <Text style={[styles.categoryText, { fontSize: s(10) }]}>
              {product.category?.name ?? "Uncategorized"}
            </Text>
          </View>
          <View style={styles.stockStatus}>
            <View
              style={[
                styles.stockDot,
                {
                  width: s(6),
                  height: s(6),
                  borderRadius: s(3),
                  backgroundColor: stockStatus.color,
                  marginRight: sx(5),
                },
              ]}
            />
            <Text
              style={[
                styles.stockText,
                { fontSize: s(14), color: stockStatus.color },
              ]}
            >
              {stockStatus.text}
            </Text>
          </View>
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
    flexDirection: "row",
    shadowColor: "#CF4A22",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
  },
  image: {
    backgroundColor: "#E0E0E0",
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
    flex: 1,
  },
  price: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  sku: {
    color: "#71717B",
    fontFamily: FONTS.medium,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: "rgba(241, 112, 73, 0.18)",
  },
  categoryText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  stockStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockDot: {},
  stockText: {
    fontFamily: FONTS.medium,
  },
});
