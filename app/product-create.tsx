import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Autocomplete, AutocompleteItem } from "@/components/autocomplete";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { useToast } from "@/contexts/toast-context";
import { useScale } from "@/hooks/use-scale";
import {
  brandsService,
  categoriesService,
  productTypesService,
  productsService,
} from "@/services/products";
import { useProductStore } from "@/stores/product-store";
import { Brand } from "@/types/brand";
import { Category } from "@/types/category";
import { ProductType } from "@/types/product-type";
import { mapProductResponseToProduct, ProductRequest } from "@/types/product";
import { getErrorMessage } from "@/utils/error-handler";

export default function ProductCreateScreen() {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { showSuccess, showError, showWarning } = useToast();
  const addProduct = useProductStore((state) => state.addProduct);

  // Form state
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [weightGrams, setWeightGrams] = useState("");
  const [thcPercentage, setThcPercentage] = useState("");
  const [cbdPercentage, setCbdPercentage] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [productType, setProductType] = useState<ProductType | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGoBack = () => {
    router.back();
  };

  const fetchBrands = useCallback(async (): Promise<AutocompleteItem[]> => {
    const response = await brandsService.listActive();
    return response.data;
  }, []);

  const fetchCategories = useCallback(async (): Promise<AutocompleteItem[]> => {
    const response = await categoriesService.listActive();
    return response.data;
  }, []);

  const fetchProductTypes = useCallback(async (): Promise<AutocompleteItem[]> => {
    const response = await productTypesService.listActive();
    return response.data;
  }, []);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showWarning("Please allow access to your photo library in settings.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      showError("Failed to open photo library.");
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        showWarning("Please allow camera access in settings.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      showError("Failed to open camera.");
    }
  };

  const showImageOptions = () => {
    Alert.alert("Add Product Image", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = "Price must be a valid positive number";
    }

    if (weightGrams && (isNaN(Number(weightGrams)) || Number(weightGrams) < 0)) {
      newErrors.weightGrams = "Weight must be a valid number";
    }

    if (thcPercentage && (isNaN(Number(thcPercentage)) || Number(thcPercentage) < 0 || Number(thcPercentage) > 100)) {
      newErrors.thcPercentage = "THC must be between 0 and 100";
    }

    if (cbdPercentage && (isNaN(Number(cbdPercentage)) || Number(cbdPercentage) < 0 || Number(cbdPercentage) > 100)) {
      newErrors.cbdPercentage = "CBD must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const productData: ProductRequest = {
        name: name.trim(),
        sku: sku.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        brandId: brand?.id,
        categoryId: category?.id,
        productTypeId: productType?.id,
        weightGrams: weightGrams ? Number(weightGrams) : undefined,
        thcPercentage: thcPercentage ? Number(thcPercentage) : undefined,
        cbdPercentage: cbdPercentage ? Number(cbdPercentage) : undefined,
      };

      // Step 1: Create product
      const response = await productsService.create(productData);
      let product = mapProductResponseToProduct(response.data);

      // Step 2: Upload image if selected
      if (imageUri) {
        try {
          const imageResponse = await productsService.uploadImage(product.id, imageUri);
          product = mapProductResponseToProduct(imageResponse.data);
        } catch (imageError) {
          console.warn("Failed to upload image:", imageError);
          showWarning("Product created, but image upload failed.");
        }
      }

      addProduct(product);

      // Invalidate products query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["products"] });

      showSuccess("Product created successfully!");

      // Delay navigation to ensure layout is mounted
      setTimeout(() => {
        router.back();
      }, 100);
    } catch (error) {
      console.error("Failed to create product:", error);
      showError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer showPattern={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
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
            <Pressable
              style={[
                styles.backButton,
                {
                  width: s(46),
                  height: s(46),
                  borderRadius: s(7),
                },
              ]}
              onPress={handleGoBack}
            >
              <Feather name="arrow-left" size={s(22)} color={COLORS.text} />
            </Pressable>
            <Text style={[styles.title, { fontSize: s(20) }]}>New Product</Text>
            <View style={{ width: s(46) }} />
          </View>

          {/* Form */}
          <ScrollView
            style={styles.form}
            contentContainerStyle={[
              styles.formContent,
              {
                paddingHorizontal: sx(20),
                paddingBottom: sy(40),
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Basic Info Section */}
            <Text style={[styles.sectionTitle, { fontSize: s(16), marginBottom: sy(12) }]}>
              Basic Information
            </Text>

            <Input
              label="Product Name *"
              placeholder="Enter product name"
              value={name}
              onChangeText={setName}
            />
            {errors.name && (
              <Text style={[styles.errorText, { fontSize: s(12) }]}>
                {errors.name}
              </Text>
            )}

            <Input
              label="SKU *"
              placeholder="Enter SKU"
              value={sku}
              onChangeText={setSku}
              autoCapitalize="characters"
            />
            {errors.sku && (
              <Text style={[styles.errorText, { fontSize: s(12) }]}>
                {errors.sku}
              </Text>
            )}

            <Input
              label="Description"
              placeholder="Enter product description"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Input
              label="Price *"
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
            {errors.price && (
              <Text style={[styles.errorText, { fontSize: s(12) }]}>
                {errors.price}
              </Text>
            )}

            {/* Image Upload */}
            <Text style={[styles.inputLabel, { fontSize: s(14), marginBottom: sy(8) }]}>
              Product Image
            </Text>
            <Pressable
              style={[
                styles.imagePickerContainer,
                {
                  height: sy(150),
                  borderRadius: s(12),
                  marginBottom: sy(16),
                },
              ]}
              onPress={showImageOptions}
            >
              {imageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: imageUri }}
                    style={[styles.imagePreview, { borderRadius: s(12) }]}
                    contentFit="cover"
                  />
                  <Pressable
                    style={[
                      styles.removeImageButton,
                      { width: s(28), height: s(28), borderRadius: s(14) },
                    ]}
                    onPress={() => setImageUri(null)}
                  >
                    <Feather name="x" size={s(16)} color={COLORS.surface} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <Feather name="camera" size={s(32)} color={COLORS.textMuted} />
                  <Text style={[styles.imagePickerText, { fontSize: s(14), marginTop: sy(8) }]}>
                    Tap to add image
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Classification Section */}
            <Text
              style={[
                styles.sectionTitle,
                { fontSize: s(16), marginTop: sy(20), marginBottom: sy(12) },
              ]}
            >
              Classification
            </Text>

            <Autocomplete
              label="Brand"
              placeholder="Select a brand"
              value={brand}
              onSelect={setBrand}
              fetchItems={fetchBrands}
            />

            <Autocomplete
              label="Category"
              placeholder="Select a category"
              value={category}
              onSelect={setCategory}
              fetchItems={fetchCategories}
            />

            <Autocomplete
              label="Product Type"
              placeholder="Select a product type"
              value={productType}
              onSelect={setProductType}
              fetchItems={fetchProductTypes}
            />

            {/* Cannabis Info Section */}
            <Text
              style={[
                styles.sectionTitle,
                { fontSize: s(16), marginTop: sy(20), marginBottom: sy(12) },
              ]}
            >
              Cannabis Details
            </Text>

            <Input
              label="Weight (grams)"
              placeholder="0.00"
              value={weightGrams}
              onChangeText={setWeightGrams}
              keyboardType="decimal-pad"
            />
            {errors.weightGrams && (
              <Text style={[styles.errorText, { fontSize: s(12) }]}>
                {errors.weightGrams}
              </Text>
            )}

            <View style={[styles.row, { gap: sx(16) }]}>
              <View style={styles.halfInput}>
                <Input
                  label="THC %"
                  placeholder="0.00"
                  value={thcPercentage}
                  onChangeText={setThcPercentage}
                  keyboardType="decimal-pad"
                />
                {errors.thcPercentage && (
                  <Text style={[styles.errorText, { fontSize: s(12) }]}>
                    {errors.thcPercentage}
                  </Text>
                )}
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="CBD %"
                  placeholder="0.00"
                  value={cbdPercentage}
                  onChangeText={setCbdPercentage}
                  keyboardType="decimal-pad"
                />
                {errors.cbdPercentage && (
                  <Text style={[styles.errorText, { fontSize: s(12) }]}>
                    {errors.cbdPercentage}
                  </Text>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <View style={{ marginTop: sy(24) }}>
              <Button
                title={isSubmitting ? "Creating..." : "Create Product"}
                onPress={handleSubmit}
                disabled={isSubmitting}
                icon={
                  isSubmitting ? (
                    <ActivityIndicator size="small" color={COLORS.surface} />
                  ) : undefined
                }
              />
            </View>
          </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
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
  title: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  form: {
    flex: 1,
  },
  formContent: {},
  sectionTitle: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  row: {
    flexDirection: "row",
  },
  halfInput: {
    flex: 1,
  },
  errorText: {
    color: "#FF541C",
    marginTop: -8,
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
  inputLabel: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  imagePickerContainer: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imagePickerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  imagePickerText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
  imagePreviewContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
