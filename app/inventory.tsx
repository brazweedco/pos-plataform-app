import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/bottom-tab-bar";
import { FilterTabs, FilterTab } from "@/components/filter-tabs";
import { ChatIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ScreenContainer } from "@/components/screen-container";
import { SearchBar } from "@/components/search-bar";
import { COLORS } from "@/constants/layout";
import { useProducts } from "@/hooks/use-products";
import { useScale } from "@/hooks/use-scale";
import { LOW_STOCK_THRESHOLD, Product } from "@/types/product";

type StockFilter = "all" | "low" | "out";

const FILTER_TABS: FilterTab<StockFilter>[] = [
  { key: "all", label: "All Items" },
  { key: "low", label: "Low Stock" },
  { key: "out", label: "Out of Stock" },
];

export default function InventoryScreen() {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<
    "home" | "product" | "orders" | "stock" | "settings"
  >("stock");
  const [activeFilter, setActiveFilter] = useState<StockFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products from API
  const { products, isLoading, refetch } = useProducts();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleTabPress = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === "home") {
      router.push("/home");
    } else if (tab === "product") {
      router.push("/products");
    }
  };

  const handleAddProduct = () => {
    router.push("/product-create");
  };

  const handleFilterPress = () => {
    // Open filter modal
  };

  const handleProductPress = (product: Product) => {
    // Navigate to product detail
  };

  // Filter products based on active filter and search query
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())

    // Stock filter
    if (activeFilter === "low") {
      return matchesSearch && product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
    }
    if (activeFilter === "out") {
      return matchesSearch && product.stock === 0;
    }
    return matchesSearch;
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
          <Text style={[styles.title, { fontSize: s(26) }]}>Inventory</Text>
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
            <Feather name="plus" size={s(20)} color={COLORS.text} />
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
            paddingHorizontal: sx(20),
            marginTop: sy(18),
            marginBottom: sy(18),
          }}
        >
          <FilterTabs
            tabs={FILTER_TABS}
            activeTab={activeFilter}
            onTabPress={setActiveFilter}
          />
        </View>

        {/* Products List */}
        <ScrollView
          style={styles.productsList}
          contentContainerStyle={[
            styles.productsContent,
            {
              paddingHorizontal: sx(20),
              paddingBottom: sy(120),
              gap: sy(11),
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {isLoading ? (
            <View style={[styles.emptyState, { paddingVertical: sy(40) }]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={[styles.emptyState, { paddingVertical: sy(40) }]}>
              <Text style={[styles.emptyStateText, { fontSize: s(16) }]}>
                No products found
              </Text>
            </View>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={handleProductPress}
              />
            ))
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <Pressable
          style={[
            styles.fab,
            {
              width: s(48),
              height: s(48),
              borderRadius: s(24),
              right: sx(20),
              bottom: sy(96),
            },
          ]}
        >
          <ChatIcon size={s(20)} />
        </Pressable>

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
    fontWeight: "600",
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
  productsContent: {},
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    color: COLORS.textMuted,
  },
  fab: {
    position: "absolute",
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
