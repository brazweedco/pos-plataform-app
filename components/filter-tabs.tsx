import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES, TAB_HEIGHT } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";

export interface FilterTab<T extends string = string> {
  key: T;
  label: string;
}

interface FilterTabsProps<T extends string = string> {
  tabs: FilterTab<T>[];
  activeTab: T;
  onTabPress: (tab: T) => void;
  scrollable?: boolean;
}

export function FilterTabs<T extends string = string>({
  tabs,
  activeTab,
  onTabPress,
  scrollable = false,
}: FilterTabsProps<T>) {
  const { s, sx, sy } = useScale();

  const content = (
    <View style={[styles.container, { gap: sx(10) }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              {
                height: sy(TAB_HEIGHT),
                borderRadius: s(10),
                paddingHorizontal: sx(22),
                opacity: pressed && !isActive ? 0.7 : 1,
              },
            ]}
            onPress={() => onTabPress(tab.key)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[
                styles.tabText,
                isActive && styles.tabTextActive,
                { fontSize: s(FONT_SIZES.md) },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: sx(20) }]}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  scrollContent: {
    flexGrow: 1,
  },
  tab: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(241, 112, 73, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  tabTextActive: {
    color: COLORS.surface,
  },
});
