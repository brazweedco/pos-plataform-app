import { router, useLocalSearchParams } from "expo-router";
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
import { useProducts } from "@/hooks/use-products";
import { useScale } from "@/hooks/use-scale";
import { productsService } from "@/services/products";
import { useProductStore } from "@/stores/product-store";
import { mapProductResponseToProduct, ProductRequest } from "@/types/product";
import { getErrorMessage } from "@/utils/error-handler";

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, sy } = useScale();
  const insets = useSafeAreaInsets();
  const { showSuccess, showError, showWarning } = useToast();
  const updateProduct = useProductStore((state) => state.updateProduct);

  const { products, isLoading } = useProducts();
  const product = products.find((p) => p.id === id);

  const handleSubmit = async (data: ProductRequest, imageUri: string | null) => {
    if (!id) return;

    let response;
    try {
      response = await productsService.update(id, data);
    } catch (err) {
      showError(getErrorMessage(err));
      throw err;
    }

    let updatedProduct = mapProductResponseToProduct(response.data);

    if (imageUri) {
      try {
        const imageResponse = await productsService.uploadImage(id, imageUri);
        updatedProduct = mapProductResponseToProduct(imageResponse.data);
      } catch {
        showWarning("Product updated, but image upload failed.");
      }
    }

    updateProduct(updatedProduct);
    showSuccess("Product updated successfully!");
    router.back();
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
