import { router } from "expo-router";
import { useEffect } from "react";

import { api } from "@/services/api";
import { authService } from "@/services/auth";
import { useUserStore } from "@/stores/user-store";
import { useCartStore } from "@/stores/cart-store";

export function useSession() {
  const clearUser = useUserStore((state) => state.clear);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Set callback for when session expires
    api.setOnSessionExpired(() => {
      handleSessionExpired();
    });

    return () => {
      // Clean up callback on unmount
      api.setOnSessionExpired(() => {});
    };
  }, []);

  const handleSessionExpired = async () => {
    // Clear all user data
    await authService.logout();
    clearUser();
    clearCart();

    // Redirect to login
    router.replace("/login");
  };

  return {
    handleSessionExpired,
  };
}
