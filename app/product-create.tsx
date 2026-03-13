import { router } from "expo-router";
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
import { productsService } from "@/services/products";
import { useProductStore } from "@/stores/product-store";
import { mapProductResponseToProduct, ProductRequest } from "@/types/product";
import { getErrorMessage } from "@/utils/error-handler";

export default function ProductCreateScreen() {
  const insets = useSafeAreaInsets();
  const { showSuccess, showError, showWarning } = useToast();
  const addProduct = useProductStore((state) => state.addProduct);

  const handleSubmit = async (data: ProductRequest, imageUri: string | null) => {
    let response;
    try {
      response = await productsService.create(data);
    } catch (err) {
      showError(getErrorMessage(err));
      throw err;
    }

    let product = mapProductResponseToProduct(response.data);

    if (imageUri) {
      try {
        const imageResponse = await productsService.uploadImage(product.id, imageUri);
        product = mapProductResponseToProduct(imageResponse.data);
      } catch {
        showWarning("Product created, but image upload failed.");
      }
    }

    addProduct(product);
    showSuccess("Product created successfully!");
    router.back();
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
