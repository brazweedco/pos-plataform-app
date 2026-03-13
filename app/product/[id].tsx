import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/bottom-tab-bar";
import { Button } from "@/components/button";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  DropletIcon,
  PackageIcon,
} from "@/components/icons";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES } from "@/constants/typography";
import { useProducts } from "@/hooks/use-products";
import { useScale } from "@/hooks/use-scale";
import { navigateToTab, TabName } from "@/utils/navigation";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();

  const { products, isLoading } = useProducts();
  const product = products.find((p) => p.id === id);

  const handleBack = () => {
    router.back();
  };

  const handleTabPress = (tab: TabName) => {
    navigateToTab(tab);
  };

  const handleEdit = () => {
    router.push(`/product-edit/${id}`);
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart
  };

  if (isLoading) {
    return (
      <ScreenContainer showPattern={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!product) {
    return (
      <ScreenContainer showPattern={false}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { fontSize: s(FONT_SIZES.md) }]}>
            Product not found
          </Text>
          <Pressable
            style={[styles.backButtonAlt, { marginTop: sy(20) }]}
            onPress={handleBack}
          >
            <Text style={[styles.backButtonText, { fontSize: s(FONT_SIZES.md) }]}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer showPattern={false}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: sy(180) }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Image */}
          <View style={[styles.heroContainer, { height: sy(285) }]}>
            <Image
              source={{ uri: product.image }}
              style={styles.heroImage}
              contentFit="cover"
            />

            {/* Back Button */}
            <Pressable
              style={[
                styles.backButton,
                {
                  width: s(42),
                  height: s(42),
                  borderRadius: s(21),
                  top: insets.top + sy(10),
                  left: sx(20),
                },
              ]}
              onPress={handleBack}
            >
              <ChevronLeftIcon size={s(24)} color={COLORS.text} />
            </Pressable>

            {/* Edit Button */}
            <Pressable
              style={[
                styles.editButton,
                {
                  width: s(42),
                  height: s(42),
                  borderRadius: s(21),
                  top: insets.top + sy(10),
                  right: sx(20),
                },
              ]}
              onPress={handleEdit}
            >
              <Feather name="edit-2" size={s(20)} color={COLORS.text} />
            </Pressable>

            {/* Category Badges - Bottom Right */}
            <View
              style={[
                styles.badgesContainer,
                {
                  bottom: sy(15),
                  right: sx(20),
                  gap: sx(10),
                },
              ]}
            >
              {product.category && (
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      paddingHorizontal: sx(25),
                      paddingVertical: sy(5),
                      borderRadius: s(12),
                    },
                  ]}
                >
                  <Text style={[styles.categoryBadgeText, { fontSize: s(FONT_SIZES.sm) }]}>
                    {product.category.name}
                  </Text>
                </View>
              )}
              {product.productType && (
                <View
                  style={[
                    styles.typeBadge,
                    {
                      paddingHorizontal: sx(25),
                      paddingVertical: sy(5),
                      borderRadius: s(12),
                    },
                  ]}
                >
                  <Text style={[styles.typeBadgeText, { fontSize: s(FONT_SIZES.sm) }]}>
                    {product.productType.name}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Content */}
          <View style={[styles.content, { paddingHorizontal: sx(20) }]}>
            {/* Brand */}
            {product.brand && (
              <Text
                style={[
                  styles.brandName,
                  { fontSize: s(FONT_SIZES.lg), marginTop: sy(20) },
                ]}
              >
                {product.brand.name.toUpperCase()}
              </Text>
            )}

            {/* Product Name */}
            <Text
              style={[styles.productName, { fontSize: s(FONT_SIZES["3xl"]), marginTop: sy(5) }]}
            >
              {product.name}
            </Text>

            {/* Info Pills */}
            <View style={[styles.infoPills, { marginTop: sy(17), gap: sx(11) }]}>
              {product.thcPercentage !== undefined && product.thcPercentage > 0 && (
                <View
                  style={[
                    styles.infoPill,
                    {
                      height: sy(50),
                      paddingHorizontal: sx(22),
                      borderRadius: s(10),
                      gap: sx(10),
                    },
                  ]}
                >
                  <DropletIcon size={s(16)} color={COLORS.primary} />
                  <Text style={[styles.infoPillText, { fontSize: s(FONT_SIZES.md) }]}>
                    {product.thcPercentage}% THC
                  </Text>
                </View>
              )}
              {product.cbdPercentage !== undefined && product.cbdPercentage > 0 && (
                <View
                  style={[
                    styles.infoPill,
                    {
                      height: sy(50),
                      paddingHorizontal: sx(22),
                      borderRadius: s(10),
                      gap: sx(10),
                    },
                  ]}
                >
                  <DropletIcon size={s(16)} color={COLORS.primary} />
                  <Text style={[styles.infoPillText, { fontSize: s(FONT_SIZES.md) }]}>
                    {product.cbdPercentage}% CBD
                  </Text>
                </View>
              )}
              {product.weightGrams && (
                <View
                  style={[
                    styles.infoPill,
                    {
                      height: sy(50),
                      paddingHorizontal: sx(22),
                      borderRadius: s(10),
                      gap: sx(10),
                    },
                  ]}
                >
                  <PackageIcon size={s(16)} color={COLORS.primary} />
                  <Text style={[styles.infoPillText, { fontSize: s(FONT_SIZES.md) }]}>
                    {product.weightGrams}g
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text
              style={[
                styles.sectionTitle,
                { fontSize: s(FONT_SIZES.lg), marginTop: sy(26) },
              ]}
            >
              Description
            </Text>
            <Text
              style={[
                styles.descriptionText,
                { fontSize: s(FONT_SIZES.md), marginTop: sy(10), lineHeight: s(FONT_SIZES["2xl"]) },
              ]}
            >
              {product.description || "No description available."}
            </Text>

            {/* Compliance Box */}
            <View
              style={[
                styles.complianceBox,
                {
                  marginTop: sy(20),
                  paddingHorizontal: sx(13),
                  paddingVertical: sy(13),
                  borderRadius: s(14),
                  gap: sx(12),
                },
              ]}
            >
              <CheckCircleIcon size={s(20)} color={COLORS.primary} />
              <View style={styles.complianceContent}>
                <Text style={[styles.complianceTitle, { fontSize: s(FONT_SIZES.sm) }]}>
                  COMPLIANCE VERIFIED
                </Text>
                <Text
                  style={[
                    styles.complianceSubtitle,
                    { fontSize: s(FONT_SIZES.sm), marginTop: sy(4) },
                  ]}
                >
                  SKU: {product.sku}
                </Text>
              </View>
            </View>

            {/* Stock Level */}
            <View style={[styles.infoRow, { marginTop: sy(20) }]}>
              <Text style={[styles.infoLabel, { fontSize: s(FONT_SIZES.md) }]}>
                Stock Level
              </Text>
              <Text style={[styles.infoValue, { fontSize: s(FONT_SIZES.lg) }]}>
                {product.stock} Units Available
              </Text>
            </View>

            {/* Price */}
            <View style={[styles.infoRow, { marginTop: sy(16) }]}>
              <Text style={[styles.infoLabel, { fontSize: s(FONT_SIZES.md) }]}>
                Tax included in final calc
              </Text>
              <Text style={[styles.priceText, { fontSize: s(FONT_SIZES.xl) }]}>
                ${product.price.toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Add to Cart Button */}
        <View
          style={[
            styles.bottomButtonContainer,
            {
              paddingHorizontal: sx(20),
              paddingTop: sy(15),
              paddingBottom: sy(96),
            },
          ]}
        >
          <Button title="Add to cart" onPress={handleAddToCart} />
        </View>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBarContainer}>
          <BottomTabBar activeTab="product" onTabPress={handleTabPress} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
  backButtonAlt: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.surface,
    fontFamily: FONTS.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    width: "100%",
    backgroundColor: "#E0E0E0",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgesContainer: {
    position: "absolute",
    flexDirection: "row",
  },
  categoryBadge: {
    backgroundColor: COLORS.surface,
  },
  categoryBadgeText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  typeBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  typeBadgeText: {
    color: COLORS.surface,
    fontFamily: FONTS.medium,
  },
  content: {},
  brandName: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  productName: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  infoPills: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(241, 112, 73, 0.25)",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  infoPillText: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  sectionTitle: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  descriptionText: {
    color: "#71717B",
    fontFamily: FONTS.regular,
  },
  complianceBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(241, 112, 73, 0.25)",
  },
  complianceContent: {
    flex: 1,
  },
  complianceTitle: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
    textTransform: "uppercase",
  },
  complianceSubtitle: {
    color: COLORS.primary,
    fontFamily: FONTS.regular,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    color: "#71717B",
    fontFamily: FONTS.regular,
  },
  infoValue: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  priceText: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
