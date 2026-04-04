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
import { ProductFilterModal, ProductFilters } from "@/components/product-filter-modal";
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
import { Product, LOW_STOCK_THRESHOLD } from "@/types/product";

export default function ProductsScreen() {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();
  const { showSuccess } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const [activeTab, setActiveTab] = useState<TabName>("product");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<ProductFilters>({});

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
    setShowFilterModal(true);
  };

  const handleApplyFilters = (filters: ProductFilters) => {
    setAdvancedFilters(filters);
    // If a category filter is applied, also update the category tab
    if (filters.categoryId) {
      setActiveFilter(filters.categoryId);
    }
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
    showSuccess(`${product.name} added to cart`);
  };

  // Filter products based on active filter, search query, and advanced filters
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category filter (from tabs or advanced filters)
    if (activeFilter !== "all" && product.category?.id !== activeFilter) {
      return false;
    }

    // Advanced filters
    if (advancedFilters.brandId && product.brand?.id !== advancedFilters.brandId) {
      return false;
    }

    if (advancedFilters.minPrice && product.price < advancedFilters.minPrice) {
      return false;
    }

    if (advancedFilters.maxPrice && product.price > advancedFilters.maxPrice) {
      return false;
    }

    if (advancedFilters.inStock && product.stock <= 0) {
      return false;
    }

    if (advancedFilters.lowStock && product.stock > LOW_STOCK_THRESHOLD) {
      return false;
    }

    return true;
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
            style={({ pressed }) => [
              styles.addButton,
              {
                width: s(46),
                height: s(46),
                borderRadius: s(7),
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={handleAddProduct}
            accessibilityRole="button"
            accessibilityLabel="Add new product"
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
              <View style={[styles.emptyState, { paddingVertical: sy(48), paddingHorizontal: sx(32) }]}>
                <Text style={[styles.emptyStateTitle, { fontSize: s(FONT_SIZES.lg) }]}>
                  {searchQuery
                    ? "No products match your search"
                    : "No products found"}
                </Text>
                <Text
                  style={[
                    styles.emptyStateText,
                    { fontSize: s(FONT_SIZES.sm), marginTop: sy(8) },
                  ]}
                >
                  {searchQuery
                    ? "Try a different name, SKU, or clear the filters"
                    : "Add your first product using the + button above"}
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

      {/* Filter Modal */}
      <ProductFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialFilters={advancedFilters}
      />
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
  emptyStateTitle: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
    textAlign: "center",
  },
  emptyStateText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    textAlign: "center",
    lineHeight: 22,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
