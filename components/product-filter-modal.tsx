import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";
import { useBrands } from "@/hooks/use-brands";
import { useCategories } from "@/hooks/use-categories";
import { Brand } from "@/types/brand";
import { Category } from "@/types/category";

export interface ProductFilters {
  brandId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
}

interface ProductFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ProductFilters) => void;
  initialFilters?: ProductFilters;
}

export function ProductFilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: ProductFilterModalProps) {
  const { s, sx, sy } = useScale();
  const { brands } = useBrands();
  const { categories } = useCategories();

  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>(initialFilters?.brandId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(initialFilters?.categoryId);
  const [minPrice, setMinPrice] = useState(initialFilters?.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice?.toString() ?? "");
  const [inStock, setInStock] = useState(initialFilters?.inStock ?? false);
  const [lowStock, setLowStock] = useState(initialFilters?.lowStock ?? false);

  useEffect(() => {
    if (visible && initialFilters) {
      setSelectedBrandId(initialFilters.brandId);
      setSelectedCategoryId(initialFilters.categoryId);
      setMinPrice(initialFilters.minPrice?.toString() ?? "");
      setMaxPrice(initialFilters.maxPrice?.toString() ?? "");
      setInStock(initialFilters.inStock ?? false);
      setLowStock(initialFilters.lowStock ?? false);
    }
  }, [visible, initialFilters]);

  const handleClear = () => {
    setSelectedBrandId(undefined);
    setSelectedCategoryId(undefined);
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setLowStock(false);
  };

  const handleApply = () => {
    const filters: ProductFilters = {};

    if (selectedBrandId) filters.brandId = selectedBrandId;
    if (selectedCategoryId) filters.categoryId = selectedCategoryId;
    if (minPrice && !isNaN(Number(minPrice))) filters.minPrice = Number(minPrice);
    if (maxPrice && !isNaN(Number(maxPrice))) filters.maxPrice = Number(maxPrice);
    if (inStock) filters.inStock = true;
    if (lowStock) filters.lowStock = true;

    onApply(filters);
    onClose();
  };

  const renderChipGroup = (
    label: string,
    items: { id: string; name: string }[],
    selectedId: string | undefined,
    onSelect: (id: string | undefined) => void
  ) => (
    <View style={{ marginBottom: sy(20) }}>
      <Text style={[styles.label, { fontSize: s(FONT_SIZES.md), marginBottom: sy(10) }]}>
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.chipContainer, { gap: sx(8) }]}>
          <Pressable
            style={[
              styles.chip,
              { paddingHorizontal: sx(16), paddingVertical: sy(8), borderRadius: s(20) },
              !selectedId && styles.chipSelected,
            ]}
            onPress={() => onSelect(undefined)}
          >
            <Text
              style={[
                styles.chipText,
                { fontSize: s(FONT_SIZES.sm) },
                !selectedId && styles.chipTextSelected,
              ]}
            >
              All
            </Text>
          </Pressable>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.chip,
                { paddingHorizontal: sx(16), paddingVertical: sy(8), borderRadius: s(20) },
                selectedId === item.id && styles.chipSelected,
              ]}
              onPress={() => onSelect(selectedId === item.id ? undefined : item.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  { fontSize: s(FONT_SIZES.sm) },
                  selectedId === item.id && styles.chipTextSelected,
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderCheckbox = (
    label: string,
    checked: boolean,
    onToggle: () => void
  ) => (
    <Pressable
      style={[styles.checkboxRow, { paddingVertical: sy(12) }]}
      onPress={onToggle}
    >
      <View
        style={[
          styles.checkbox,
          { width: s(22), height: s(22), borderRadius: s(4) },
          checked && styles.checkboxChecked,
        ]}
      >
        {checked && <Feather name="check" size={s(14)} color={COLORS.surface} />}
      </View>
      <Text style={[styles.checkboxLabel, { fontSize: s(FONT_SIZES.md), marginLeft: sx(12) }]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingHorizontal: sx(20), paddingTop: sy(20) }]}>
        {/* Header */}
        <View style={[styles.header, { marginBottom: sy(24) }]}>
          <Text style={[styles.title, { fontSize: s(FONT_SIZES.xl) }]}>Filters</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Feather name="x" size={s(24)} color={COLORS.text} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Category Filter */}
          {renderChipGroup("Category", categories, selectedCategoryId, setSelectedCategoryId)}

          {/* Brand Filter */}
          {renderChipGroup("Brand", brands, selectedBrandId, setSelectedBrandId)}

          {/* Price Range */}
          <Text style={[styles.label, { fontSize: s(FONT_SIZES.md), marginBottom: sy(10) }]}>
            Price Range
          </Text>
          <View style={[styles.priceRow, { gap: sx(16), marginBottom: sy(20) }]}>
            <View style={{ flex: 1 }}>
              <Input
                label="Min"
                placeholder="0.00"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Max"
                placeholder="0.00"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Stock Filters */}
          <Text style={[styles.label, { fontSize: s(FONT_SIZES.md), marginBottom: sy(10) }]}>
            Stock Status
          </Text>
          {renderCheckbox("In Stock Only", inStock, () => setInStock(!inStock))}
          {renderCheckbox("Low Stock", lowStock, () => setLowStock(!lowStock))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.buttonContainer, { paddingVertical: sy(20), gap: sy(12) }]}>
          <Button
            title="Clear All"
            variant="secondary"
            onPress={handleClear}
          />
          <Button
            title="Apply Filters"
            onPress={handleApply}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  label: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  chipTextSelected: {
    color: COLORS.surface,
  },
  priceRow: {
    flexDirection: "row",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
