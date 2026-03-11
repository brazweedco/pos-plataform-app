import { useEffect } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/bottom-tab-bar";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { useScale } from "@/hooks/use-scale";
import { navigateToTab, TabName } from "@/utils/navigation";

export default function OrdersScreen() {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Alert.alert("Coming Soon", "Orders feature is under development.");
  }, []);

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
          <Text style={[styles.title, { fontSize: s(26) }]}>Orders</Text>
        </View>

        {/* Coming Soon Content */}
        <View style={styles.content}>
          <Text style={[styles.comingSoonText, { fontSize: s(18) }]}>
            Coming Soon
          </Text>
          <Text
            style={[
              styles.comingSoonSubtext,
              { fontSize: s(14), marginTop: sy(8) },
            ]}
          >
            This feature is under development
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
  comingSoonText: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  comingSoonSubtext: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
