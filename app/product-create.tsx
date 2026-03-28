import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductForm } from "@/components/product-form";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/ui";
import { useToast } from "@/contexts/toast-context";
import { useAsyncHandler } from "@/hooks/use-async-handler";
import { productsService } from "@/services/products";
import { useProductStore } from "@/stores/product-store";
import { mapProductResponseToProduct, ProductRequest } from "@/types/product";

export default function ProductCreateScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { showWarning } = useToast();
  const addProduct = useProductStore((state) => state.addProduct);

  const { execute } = useAsyncHandler({
    showSuccessToast: true,
    successMessage: "Product created successfully!",
    showErrorToast: true,
  });

  const handleSubmit = async (data: ProductRequest, imageUri: string | null, stockQuantity: number | null) => {
    const result = await execute(async () => {
      const response = await productsService.create(data);
      let product = mapProductResponseToProduct(response.data);

      if (imageUri) {
        try {
          const imageResponse = await productsService.uploadImage(product.id, imageUri);
          product = mapProductResponseToProduct(imageResponse.data);
        } catch {
          showWarning("Product created, but image upload failed.");
        }
      }

      // Update stock quantity if provided
      if (stockQuantity !== null && stockQuantity >= 0) {
        try {
          await productsService.updateStock(product.id, stockQuantity);
          product.stock = stockQuantity;
        } catch {
          showWarning("Product created, but stock update failed.");
        }
      }

      addProduct(product);
      return product;
    });

    if (result) {
      // Invalidate products cache to refresh list
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      router.back();
    } else {
      throw new Error("Product creation failed");
    }
  };

  return (
    <ScreenContainer showPattern={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <ScreenHeader title="New Product" />

          <ProductForm
            onSubmit={handleSubmit}
            submitLabel="Create Product"
            submittingLabel="Creating..."
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
});
