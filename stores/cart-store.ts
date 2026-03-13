import { create } from "zustand";

import { Product } from "@/types/product";
import { CartItem, LEGAL_LIMIT_GRAMS } from "@/types/cart";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  getTotalWeight: () => number;
  getLegalLimitPercentage: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, quantity = 1) =>
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        items: [...state.items, { product, quantity }],
      };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.product.id !== productId),
        };
      }

      return {
        items: state.items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      };
    }),

  incrementQuantity: (productId) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    })),

  decrementQuantity: (productId) =>
    set((state) => {
      const item = state.items.find((i) => i.product.id === productId);
      if (item && item.quantity <= 1) {
        return {
          items: state.items.filter((i) => i.product.id !== productId),
        };
      }

      return {
        items: state.items.map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        ),
      };
    }),

  clearCart: () => set({ items: [] }),

  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    const { items } = get();
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },

  getTotal: () => {
    // For now, total equals subtotal (no tax/discount implemented)
    return get().getSubtotal();
  },

  getTotalWeight: () => {
    const { items } = get();
    return items.reduce(
      (total, item) => total + (item.product.weightGrams || 0) * item.quantity,
      0
    );
  },

  getLegalLimitPercentage: () => {
    const totalWeight = get().getTotalWeight();
    return Math.min((totalWeight / LEGAL_LIMIT_GRAMS) * 100, 100);
  },
}));
