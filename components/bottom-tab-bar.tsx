import { FONTS } from "@/constants/fonts";
import { COLORS } from "@/constants/layout";
import { FONT_SIZES } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";
import { TabName } from "@/utils/navigation";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { HomeSvg } from "./icons/home-icon";
import { OrderSvg } from "./icons/order-icon";
import { ProductSvg } from "./icons/product-icon";
import { SettingsSvg } from "./icons/settings-icon";
import { StockSvg } from "./icons/stock-icon";

interface BottomTabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

interface TabIconProps {
  active: boolean;
  size: number;
}

const TAB_ICON_INACTIVE = COLORS.textMuted;

function HomeIcon({ active, size }: TabIconProps) {
  const color = active ? COLORS.primary : TAB_ICON_INACTIVE;
  return <HomeSvg size={size} color={color} />;
}

function ProductIcon({ active, size }: TabIconProps) {
  const color = active ? COLORS.primary : TAB_ICON_INACTIVE;
  return <ProductSvg size={size} color={color} />;
}

function OrdersIcon({ active, size }: TabIconProps) {
  const color = active ? COLORS.primary : TAB_ICON_INACTIVE;
  return <OrderSvg size={size} color={color} />;
}

function StockIcon({ active, size }: TabIconProps) {
  const color = active ? COLORS.primary : TAB_ICON_INACTIVE;
  return <StockSvg size={size} color={color} />;
}

function SettingsIcon({ active, size }: TabIconProps) {
  const color = active ? COLORS.primary : TAB_ICON_INACTIVE;
  return <SettingsSvg size={size} color={color} />;
}

const TABS: { key: TabName; label: string; Icon: typeof HomeIcon }[] = [
  { key: "home", label: "Home", Icon: HomeIcon },
  { key: "product", label: "Product", Icon: ProductIcon },
  { key: "orders", label: "Orders", Icon: OrdersIcon },
  { key: "stock", label: "Stock", Icon: StockIcon },
  { key: "settings", label: "Settings", Icon: SettingsIcon },
];

export function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
  const { s, sy } = useScale();

  return (
    <View
      style={[styles.container, { height: sy(82) }]}
      accessibilityRole="tablist"
    >
      {TABS.map(({ key, label, Icon }) => {
        const isActive = activeTab === key;
        return (
          <Pressable
            key={key}
            style={({ pressed }) => [
              styles.tab,
              { opacity: pressed && !isActive ? 0.65 : 1 },
            ]}
            onPress={() => onTabPress(key)}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isActive }}
          >
            <Icon active={isActive} size={s(30)} />
            <Text
              style={[
                styles.label,
                { fontSize: s(FONT_SIZES.xs), marginTop: sy(4) },
                isActive && styles.labelActive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: "rgba(241, 112, 73, 0.25)",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
  },
  labelActive: {
    color: COLORS.primary,
  },
});
