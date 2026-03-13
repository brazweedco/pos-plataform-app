import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { navigateToTab, TabName } from "@/utils/navigation";

import { BottomTabBar } from "@/components/bottom-tab-bar";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";
import { authService } from "@/services/auth";
import { useUserStore } from "@/stores/user-store";

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

function SettingsItem({ icon, label, onPress }: SettingsItemProps) {
  const { s, sx, sy } = useScale();

  return (
    <Pressable
      style={[
        styles.settingsItem,
        {
          paddingHorizontal: sx(22),
          paddingVertical: sy(15),
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.settingsItemLeft, { gap: sx(12) }]}>
        {icon}
        <Text style={[styles.settingsItemText, { fontSize: s(FONT_SIZES.md) }]}>
          {label}
        </Text>
      </View>
      <Feather name="chevron-right" size={s(20)} color={COLORS.text} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabName>("settings");
  const clearUser = useUserStore((state) => state.clear);

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab !== "settings") {
      navigateToTab(tab);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    clearUser();
    router.replace("/login");
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
              paddingBottom: sy(22),
              borderBottomLeftRadius: s(25),
              borderBottomRightRadius: s(25),
            },
          ]}
        >
          <Text style={[styles.title, { fontSize: s(FONT_SIZES.xl) }]}>More</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{
            paddingHorizontal: sx(20),
            paddingTop: sy(24),
            paddingBottom: sy(120),
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Settings Section */}
          <Text
            style={[
              styles.sectionTitle,
              { fontSize: s(FONT_SIZES.lg), marginBottom: sy(12) },
            ]}
          >
            Settings
          </Text>

          <View
            style={[
              styles.settingsCard,
              {
                borderRadius: s(12),
                marginBottom: sy(24),
              },
            ]}
          >
            <SettingsItem
              icon={
                <Feather name="credit-card" size={s(20)} color={COLORS.text} />
              }
              label="Payments & Terminals"
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<Feather name="users" size={s(20)} color={COLORS.text} />}
              label="Staff Management"
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={
                <Feather name="file-text" size={s(20)} color={COLORS.text} />
              }
              label="Compliance & Reports"
            />
          </View>

          {/* Support Section */}
          <Text
            style={[
              styles.sectionTitle,
              { fontSize: s(FONT_SIZES.lg), marginBottom: sy(12) },
            ]}
          >
            Support
          </Text>

          <View
            style={[
              styles.settingsCard,
              {
                borderRadius: s(12),
                marginBottom: sy(24),
              },
            ]}
          >
            <SettingsItem
              icon={
                <Feather name="help-circle" size={s(20)} color={COLORS.text} />
              }
              label="Help Center"
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<Feather name="shield" size={s(20)} color={COLORS.text} />}
              label="Legal & Privacy"
            />
          </View>

          {/* Log Out Button */}
          <Pressable
            style={[
              styles.logoutButton,
              {
                height: sy(50),
                borderRadius: s(12),
              },
            ]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={s(20)} color={COLORS.text} />
            <Text
              style={[
                styles.logoutText,
                { fontSize: s(FONT_SIZES.md), marginLeft: sx(8) },
              ]}
            >
              Log Out
            </Text>
          </Pressable>
        </ScrollView>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBarContainer}>
          <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
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
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 8,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  settingsCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(241, 112, 73, 0.25)",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsItemText: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(241, 112, 73, 0.15)",
    marginHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
