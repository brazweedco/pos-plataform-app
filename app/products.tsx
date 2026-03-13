import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { navigateToTab, TabName } from "@/utils/navigation";

import { BottomTabBar } from "@/components/bottom-tab-bar";
import { FilterTabs, FilterTab } from "@/components/filter-tabs";
import { ProductGridCard } from "@/components/product-grid-card";
import { ScreenContainer } from "@/components/screen-container";
import { SearchBar } from "@/components/search-bar";
import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES } from "@/constants/typography";
import { useToast } from "@/contexts/toast-context";
import { useCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";
import { useScale } from "@/hooks/use-scale";
import { useCartStore } from "@/stores/cart-store";
import { Product } from "@/types/product";

export default function ProductsScreen() {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();
  const { showSuccess } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const [activeTab, setActiveTab] = useState<TabName>("product");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories and products from API
  const { categories } = useCategories();
  const { products, isLoading, refetch } = useProducts();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Build filter tabs from categories
  const filterTabs: FilterTab<string>[] = [
    { key: "all", label: "All" },
    ...categories.map((cat) => ({ key: cat.id, label: cat.name })),
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab !== "product") {
      navigateToTab(tab);
    }
  };

  const handleAddProduct = () => {
    router.push("/product-create");
  };

  const handleFilterPress = () => {
    // Open filter modal
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
    showSuccess(`${product.name} added to cart`);
  };

  // Filter products based on active filter and search query
  const filteredProducts = products.filter((product) => {

    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    if (activeFilter === "all") {
      return matchesSearch;
    }

    return matchesSearch && product.category?.id == activeFilter;
  });

  return (
    <ScreenContainer showPattern={false}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: sx(20),
              paddingTop: sy(20),
              marginBottom: sy(22),
            },
          ]}
        >
          <Text style={[styles.title, { fontSize: s(FONT_SIZES.xl) }]}>Products</Text>
          <Pressable
            style={[
              styles.addButton,
              {
                width: s(46),
                height: s(46),
                borderRadius: s(7),
              },
            ]}
            onPress={handleAddProduct}
          >
            <Feather name="plus" size={s(20)} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: sx(20) }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, SKU, brand..."
            onFilterPress={handleFilterPress}
          />
        </View>

        {/* Filter Tabs */}
        <View
          style={{
            marginTop: sy(18),
            marginBottom: sy(18),
          }}
        >
          <FilterTabs
            tabs={filterTabs}
            activeTab={activeFilter}
            onTabPress={setActiveFilter}
            scrollable
          />
        </View>

        {/* Products Grid */}
        <FlatList
          key="products-grid-2-columns"
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <ProductGridCard
              product={item}
              onPress={handleProductPress}
              onAddToCart={handleAddToCart}
            />
          )}
          style={styles.productsList}
          contentContainerStyle={{
            paddingHorizontal: sx(20),
            paddingBottom: sy(120),
            flexGrow: 1,
          }}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: sy(14),
          }}
          showsVerticalScrollIndicator={true}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            !isLoading ? (
              <View style={[styles.emptyState, { paddingVertical: sy(40) }]}>
                <Text style={[styles.emptyStateText, { fontSize: s(FONT_SIZES.md) }]}>
                  No products found
                </Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            isLoading ? (
              <View style={[styles.emptyState, { paddingVertical: sy(40) }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : null
          }
        />

        {/* Bottom Tab Bar */}
        <View style={styles.tabBarContainer}>
          <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  addButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(241, 112, 73, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
  },
  productsList: {
    flex: 1,
  },
  productsContent: {
    flexGrow: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
