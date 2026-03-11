import { router } from "expo-router";

export type TabName = "home" | "product" | "orders" | "stock" | "settings";

const TAB_ROUTES: Record<TabName, string> = {
  home: "/home",
  product: "/products",
  orders: "/orders",
  stock: "/inventory",
  settings: "/settings",
};

export function navigateToTab(tab: TabName): void {
  const route = TAB_ROUTES[tab];
  if (route) {
    router.push(route as never);
  }
}
