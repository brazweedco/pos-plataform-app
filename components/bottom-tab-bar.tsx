import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/layout";
import { useScale } from "@/hooks/use-scale";

type TabName = "home" | "product" | "orders" | "stock" | "settings";

interface BottomTabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

interface TabIconProps {
  active: boolean;
  size: number;
}

function HomeIcon({ active, size }: TabIconProps) {
  const color = active ? COLORS.primary : "#B7B7B7";
  return <Feather name="home" size={size} color={color} />;
}

function ProductIcon({ active, size }: TabIconProps) {
  const color = active ? COLORS.primary : "#B7B7B7";
  return <Feather name="shopping-bag" size={size} color={color} />;
}

function OrdersIcon({ active, size }: TabIconProps) {
  const color = active ? COLORS.primary : "#B7B7B7";
  return <Feather name="clipboard" size={size} color={color} />;
}

function StockIcon({ active, size }: TabIconProps) {
  const color = active ? COLORS.primary : "#B7B7B7";
  return <Feather name="package" size={size} color={color} />;
}

function SettingsIcon({ active, size }: TabIconProps) {
  const color = active ? COLORS.primary : "#B7B7B7";
  return <Feather name="settings" size={size} color={color} />;
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
    <View style={[styles.container, { height: sy(76) }]}>
      {TABS.map(({ key, label, Icon }) => (
        <Pressable
          key={key}
          style={styles.tab}
          onPress={() => onTabPress(key)}
        >
          <Icon active={activeTab === key} size={s(24)} />
          <Text
            style={[
              styles.label,
              { fontSize: s(13), marginTop: sy(4) },
              activeTab === key && styles.labelActive,
            ]}
          >
            {label}
          </Text>
        </Pressable>
      ))}
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
    color: "#B7B7B7",
    fontWeight: "500",
  },
  labelActive: {
    color: COLORS.primary,
  },
});
