import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/bottom-tab-bar";
import { DeliveryCard } from "@/components/delivery-card";
import {
  ChatIcon,
  DollarIcon,
  PackageIcon,
  PlusIcon,
  TipJarIcon,
  TruckIcon,
} from "@/components/icons";
import { ScreenContainer } from "@/components/screen-container";
import { StatCard } from "@/components/stat-card";
import { COLORS } from "@/constants/layout";
import { useScale } from "@/hooks/use-scale";
import { authService } from "@/services/auth";
import { useUserStore } from "@/stores/user-store";
import { formatRole } from "@/utils/format-role";

// Mock deliveries data (empty for now)
const DELIVERIES: {
  id: string;
  status: string;
  time: string;
  price: string;
}[] = [];

export default function HomeScreen() {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<
    "home" | "product" | "orders" | "stock" | "settings"
  >("home");

  // Get user from store
  const user = useUserStore((state) => state.user);
  const isOnline = useUserStore((state) => state.isOnline);
  const clearUser = useUserStore((state) => state.clear);

  // Extract user name (use name or email prefix)
  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const userRole = formatRole(user?.role);

  const handleNewSale = () => {
    // Navigate to new sale screen
  };

  const handleLogout = async () => {
    await authService.logout();
    clearUser();
    router.replace("/login");
  };

  const handleTabPress = (tab: typeof activeTab) => {
    setActiveTab(tab);
    // Handle navigation based on tab
    if (tab === "stock") {
      router.push("/inventory");
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
          {/* User Info */}
          <View style={styles.userInfo}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=E46C45&color=fff&size=128` }}
              style={[
                styles.avatar,
                {
                  width: s(52),
                  height: s(52),
                  borderRadius: s(26),
                },
              ]}
              contentFit="cover"
            />
            <View style={[styles.userText, { marginLeft: sx(12) }]}>
              <Text style={[styles.userRole, { fontSize: s(15) }]}>
                {userRole}
              </Text>
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { fontSize: s(26) }]}>
                  {userName}
                </Text>
                {isOnline && (
                  <View
                    style={[
                      styles.onlineBadge,
                      {
                        height: sy(28),
                        borderRadius: s(12),
                        paddingHorizontal: sx(12),
                        marginLeft: sx(10),
                      },
                    ]}
                  >
                    <Text style={[styles.onlineText, { fontSize: s(15) }]}>
                      Online
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <Pressable
            style={[
              styles.logoutButton,
              {
                width: s(46),
                height: s(46),
                borderRadius: s(7),
              },
            ]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={s(22)} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* New Sale Button */}
        <View style={[styles.buttonContainer, { paddingHorizontal: sx(20) }]}>
          <Pressable
            style={[
              styles.newSaleButton,
              {
                height: sy(55),
                borderRadius: s(12),
              },
            ]}
            onPress={handleNewSale}
          >
            <PlusIcon size={s(24)} />
            <Text
              style={[
                styles.newSaleText,
                { fontSize: s(17), marginLeft: sx(8) },
              ]}
            >
              New Sale
            </Text>
          </Pressable>
        </View>

        {/* Stats Grid */}
        <View
          style={[
            styles.statsGrid,
            {
              paddingHorizontal: sx(20),
              marginTop: sy(22),
              gap: sx(16),
            },
          ]}
        >
          <View style={[styles.statsRow, { gap: sx(16) }]}>
            <StatCard
              title="Active Sales"
              value="$0.00"
              icon={<DollarIcon size={s(28)} />}
            />
            <StatCard
              title="Today's Tips"
              value="$0.00"
              icon={<TipJarIcon size={s(28)} />}
            />
          </View>
          <View style={[styles.statsRow, { gap: sx(16) }]}>
            <StatCard
              title="Deliveries"
              value={
                <Text style={[styles.statValue, { fontSize: s(23) }]}>
                  <Text style={styles.statValueBig}>0</Text>
                  {" "}
                  <Text style={[styles.statValueSmall, { fontSize: s(15) }]}>
                    Pending
                  </Text>
                </Text>
              }
              icon={<TruckIcon size={s(30)} />}
            />
            <StatCard
              title="Low Stock"
              value="—"
              icon={<PackageIcon size={s(26)} />}
            />
          </View>
        </View>

        {/* Active Deliveries Section */}
        <View
          style={[
            styles.deliveriesHeader,
            {
              paddingHorizontal: sx(20),
              marginTop: sy(26),
              marginBottom: sy(16),
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { fontSize: s(22) }]}>
            Active Deliveries
          </Text>
          <Pressable>
            <Text style={[styles.viewAllText, { fontSize: s(14) }]}>
              View All
            </Text>
          </Pressable>
        </View>

        {/* Deliveries List */}
        <ScrollView
          style={styles.deliveriesList}
          contentContainerStyle={[
            styles.deliveriesContent,
            {
              paddingHorizontal: sx(20),
              paddingBottom: sy(100),
              gap: sy(11),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {DELIVERIES.length === 0 ? (
            <View style={[styles.emptyState, { paddingVertical: sy(40) }]}>
              <Text style={[styles.emptyStateText, { fontSize: s(16) }]}>
                No active deliveries
              </Text>
            </View>
          ) : (
            DELIVERIES.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                orderId={`Order #${delivery.id}`}
                status={delivery.status}
                time={delivery.time}
                price={delivery.price}
              />
            ))
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <Pressable
          style={[
            styles.fab,
            {
              width: s(48),
              height: s(48),
              borderRadius: s(24),
              right: sx(20),
              bottom: sy(96),
            },
          ]}
        >
          <ChatIcon size={s(20)} />
        </Pressable>

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    backgroundColor: "#E0E0E0",
  },
  userText: {
    flex: 1,
  },
  userRole: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    color: COLORS.text,
    fontWeight: "600",
  },
  onlineBadge: {
    backgroundColor: "rgba(0, 201, 70, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineText: {
    color: "#00A53A",
    fontWeight: "500",
  },
  logoutButton: {
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
  buttonContainer: {
    width: "100%",
  },
  newSaleButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 15,
    elevation: 4,
  },
  newSaleText: {
    color: COLORS.surface,
    fontWeight: "600",
  },
  statsGrid: {},
  statsRow: {
    flexDirection: "row",
  },
  statValue: {
    color: COLORS.text,
  },
  statValueBig: {
    fontWeight: "600",
    fontSize: 23,
  },
  statValueSmall: {
    fontWeight: "500",
  },
  deliveriesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: COLORS.text,
    fontWeight: "600",
  },
  viewAllText: {
    color: COLORS.secondary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  deliveriesList: {
    flex: 1,
  },
  deliveriesContent: {},
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    color: COLORS.textMuted,
  },
  fab: {
    position: "absolute",
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
