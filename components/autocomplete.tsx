import { Feather } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/layout";
import { useScale } from "@/hooks/use-scale";

export interface AutocompleteItem {
  id: string;
  name: string;
}

interface AutocompleteProps<T extends AutocompleteItem> {
  label: string;
  placeholder?: string;
  value: T | null;
  onSelect: (item: T | null) => void;
  fetchItems: () => Promise<T[]>;
  disabled?: boolean;
}

export function Autocomplete<T extends AutocompleteItem>({
  label,
  placeholder = "Select...",
  value,
  onSelect,
  fetchItems,
  disabled = false,
}: AutocompleteProps<T>) {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<T[]>([]);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchItems();
      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      setError("Failed to load items");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems]);

  useEffect(() => {
    if (isModalVisible && items.length === 0) {
      loadItems();
    }
  }, [isModalVisible, items.length, loadItems]);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setIsModalVisible(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    onSelect(null);
  };

  const openModal = () => {
    if (!disabled) {
      setIsModalVisible(true);
    }
  };

  return (
    <View style={{ marginBottom: sy(12) }}>
      <Text style={[styles.label, { fontSize: s(15), marginBottom: sy(8) }]}>
        {label}
      </Text>
      <Pressable
        style={[
          styles.inputContainer,
          {
            height: sy(50),
            borderRadius: s(12),
            paddingHorizontal: sx(11),
          },
          disabled && styles.inputDisabled,
        ]}
        onPress={openModal}
      >
        <Text
          style={[
            styles.inputText,
            { fontSize: s(14) },
            !value && styles.placeholder,
          ]}
          numberOfLines={1}
        >
          {value?.name || placeholder}
        </Text>
        {value ? (
          <Pressable
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ padding: s(4) }}
          >
            <Feather name="x" size={s(18)} color={COLORS.textMuted} />
          </Pressable>
        ) : (
          <Feather name="chevron-down" size={s(20)} color={COLORS.textMuted} />
        )}
      </Pressable>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { paddingTop: insets.top > 0 ? insets.top : sy(20) },
          ]}
        >
          {/* Modal Header */}
          <View
            style={[
              styles.modalHeader,
              {
                paddingHorizontal: sx(20),
                paddingTop: sy(20),
                marginBottom: sy(22),
              },
            ]}
          >
            <Pressable
              style={[
                styles.closeButton,
                {
                  width: s(46),
                  height: s(46),
                  borderRadius: s(7),
                },
              ]}
              onPress={() => setIsModalVisible(false)}
            >
              <Feather name="arrow-left" size={s(22)} color={COLORS.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { fontSize: s(20) }]}>
              {label}
            </Text>
            <View style={{ width: s(46) }} />
          </View>

          {/* Search Input */}
          <View style={{ paddingHorizontal: sx(20) }}>
            <View
              style={[
                styles.searchBar,
                {
                  height: sy(50),
                  borderRadius: s(12),
                  paddingHorizontal: sx(11),
                },
              ]}
            >
              <Feather
                name="search"
                size={s(22)}
                color={COLORS.textMuted}
                style={{ marginRight: sx(10) }}
              />
              <TextInput
                style={[styles.searchInput, { fontSize: s(15) }]}
                placeholder="Search..."
                placeholderTextColor="#71717B"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery !== "" && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x" size={s(18)} color={COLORS.textMuted} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Items List */}
          {isLoading ? (
            <View style={[styles.loadingContainer, { paddingVertical: sy(40) }]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : error ? (
            <View style={[styles.errorContainer, { paddingVertical: sy(40) }]}>
              <Text style={[styles.errorText, { fontSize: s(14) }]}>
                {error}
              </Text>
              <Pressable onPress={loadItems} style={{ marginTop: sy(8) }}>
                <Text style={[styles.retryText, { fontSize: s(14) }]}>
                  Tap to retry
                </Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: sx(20),
                paddingTop: sy(18),
                paddingBottom: sy(40),
              }}
              ItemSeparatorComponent={() => <View style={{ height: sy(11) }} />}
              ListEmptyComponent={
                <View style={[styles.emptyContainer, { paddingVertical: sy(40) }]}>
                  <Text style={[styles.emptyText, { fontSize: s(16) }]}>
                    No items found
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isSelected = value?.id === item.id;
                return (
                  <Pressable
                    style={[
                      styles.itemCard,
                      {
                        borderRadius: s(12),
                        paddingHorizontal: sx(16),
                        paddingVertical: sy(16),
                      },
                      isSelected && styles.itemCardSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        { fontSize: s(17) },
                        isSelected && styles.itemTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={s(20)} color={COLORS.primary} />
                    )}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: COLORS.text,
    fontWeight: "400",
  },
  inputContainer: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputDisabled: {
    opacity: 0.5,
  },
  inputText: {
    flex: 1,
    color: COLORS.text,
  },
  placeholder: {
    color: COLORS.textMuted,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    color: COLORS.text,
    fontWeight: "600",
  },
  closeButton: {
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
  searchBar: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(241, 112, 73, 0.25)",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.textMuted,
  },
  retryText: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.textMuted,
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(241, 112, 73, 0.25)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
  },
  itemCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(228, 108, 69, 0.08)",
  },
  itemText: {
    color: COLORS.text,
    fontWeight: "600",
    flex: 1,
  },
  itemTextSelected: {
    color: COLORS.primary,
  },
});
