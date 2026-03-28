import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductForm } from "@/components/product-form";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/ui";
import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES } from "@/constants/typography";
import { useToast } from "@/contexts/toast-context";
import { useAsyncHandler } from "@/hooks/use-async-handler";
import { useProducts } from "@/hooks/use-products";
import { useScale } from "@/hooks/use-scale";
import { productsService } from "@/services/products";
import { useProductStore } from "@/stores/product-store";
import { mapProductResponseToProduct, ProductRequest } from "@/types/product";

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, sy } = useScale();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { showWarning } = useToast();
  const updateProductStore = useProductStore((state) => state.updateProduct);

  const { products, isLoading: isLoadingProducts } = useProducts();
  const product = products.find((p) => p.id === id);

  const { execute } = useAsyncHandler({
    showSuccessToast: true,
    successMessage: "Product updated successfully!",
    showErrorToast: true,
  });

  const handleSubmit = async (data: ProductRequest, imageUri: string | null, stockQuantity: number | null) => {
    if (!id) return;

    const result = await execute(async () => {
      const response = await productsService.update(id, data);
      let updatedProduct = mapProductResponseToProduct(response.data);

      if (imageUri) {
        try {
          const imageResponse = await productsService.uploadImage(id, imageUri);
          updatedProduct = mapProductResponseToProduct(imageResponse.data);
        } catch {
          showWarning("Product updated, but image upload failed.");
        }
      }

      // Update stock quantity if provided
      if (stockQuantity !== null && stockQuantity >= 0) {
        try {
          await productsService.updateStock(id, stockQuantity);
          updatedProduct.stock = stockQuantity;
        } catch {
          showWarning("Product updated, but stock update failed.");
        }
      }

      updateProductStore(updatedProduct);
      return updatedProduct;
    });

    if (result) {
      // Invalidate products cache to refresh list
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      router.replace("/products");
    } else {
      throw new Error("Product update failed");
    }
  };

  if (isLoadingProducts) {
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
            onPress={() => router.back()}
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <ScreenHeader title="Edit Product" />

          <ProductForm
            initialData={product}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            submittingLabel="Saving..."
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
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
});
