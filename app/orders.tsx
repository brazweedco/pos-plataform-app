import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/bottom-tab-bar";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";
import { navigateToTab, TabName } from "@/utils/navigation";

export default function OrdersScreen() {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();

  const handleTabPress = (tab: TabName) => {
    if (tab !== "orders") {
      navigateToTab(tab);
    }
  };

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
          <Text style={[styles.title, { fontSize: s(FONT_SIZES.xl) }]}>Orders</Text>
        </View>

        {/* Empty State */}
        <View style={[styles.content, { paddingHorizontal: sx(32) }]}>
          <Text style={[styles.emptyTitle, { fontSize: s(FONT_SIZES.lg) }]}>
            No orders yet
          </Text>
          <Text
            style={[
              styles.emptySubtext,
              { fontSize: s(FONT_SIZES.sm), marginTop: sy(8), maxWidth: sx(280) },
            ]}
          >
            Completed sales and order history will appear here
          </Text>
        </View>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBarContainer}>
          <BottomTabBar activeTab="orders" onTabPress={handleTabPress} />
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
    fontFamily: FONTS.semiBold,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
    textAlign: "center",
  },
  emptySubtext: {
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
