import { create } from "zustand";

import { Product, mapProductResponseToProduct } from "@/types/product";
import { CartItem, LEGAL_LIMIT_GRAMS } from "@/types/cart";
import { CartResponse, CartItemResponse } from "@/types/cart-api";
import { cartApiService } from "@/services/cart-api";
import { productsService } from "@/services/products";

interface CartState {
  // Server-synced state
  items: CartItem[];
  serverCartId: string | null;
  serverItems: CartItemResponse[];

  // Local product cache (keeps full product data)
  productCache: Map<string, Product>;

  // Sync state
  isSyncing: boolean;
  syncError: string | null;

  // Cart actions (sync immediately with server)
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  incrementQuantity: (productId: string) => Promise<void>;
  decrementQuantity: (productId: string) => Promise<void>;
  clearCart: () => void;

  // Server sync actions
  ensureCart: () => Promise<string | null>;
  syncWithServer: () => Promise<CartResponse | null>;
  loadFromServer: (cartId: string) => Promise<void>;

  // Computed getters
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  getTotalWeight: () => number;
  getLegalLimitPercentage: () => number;
}

// Helper function to fetch full product data for cart items not in cache
async function fetchMissingProductsForCart(
  cartItems: CartItemResponse[],
  cache: Map<string, Product>
): Promise<Map<string, Product>> {
  const newCache = new Map(cache);
  const missingProductIds = cartItems
    .filter((item) => !cache.has(item.productId))
    .map((item) => item.productId);

  // Fetch missing products in parallel
  if (missingProductIds.length > 0) {
    const productPromises = missingProductIds.map(async (productId) => {
      try {
        const response = await productsService.getById(productId);
        return mapProductResponseToProduct(response);
      } catch {
        // If fetch fails, return null - we'll use fallback data
        return null;
      }
    });

    const fetchedProducts = await Promise.all(productPromises);
    fetchedProducts.forEach((product) => {
      if (product) {
        newCache.set(product.id, product);
      }
    });
  }

  return newCache;
}

// Helper function to map cart items to CartItem[] using cache with fallback
function mapCartItemsWithCache(
  cartItems: CartItemResponse[],
  cache: Map<string, Product>
): CartItem[] {
  return cartItems.map((item) => {
    const cachedProduct = cache.get(item.productId);
    return {
      product: cachedProduct || {
        id: item.productId,
        sku: item.productSku,
        name: item.productName,
        price: item.unitPrice,
        active: true,
        stock: 0,
        image: "https://via.placeholder.com/200",
      } as Product,
      quantity: item.quantity,
    };
  });
}

export const useCartStore = create<CartState>((set, get) => ({
  // Initial state
  items: [],
  serverCartId: null,
  serverItems: [],
  productCache: new Map<string, Product>(),
  isSyncing: false,
  syncError: null,

  // Ensure we have a valid cart on the server
  ensureCart: async () => {
    const { serverCartId } = get();

    if (serverCartId) {
      try {
        const cart = await cartApiService.getById(serverCartId);
        if (cart.status === "OPEN") {
          return serverCartId;
        }
      } catch {
        // Cart not found or error, create new one
      }
    }

    // Create new cart
    try {
      const cart = await cartApiService.create();
      set({ serverCartId: cart.id, serverItems: cart.items });
      return cart.id;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create cart";
      set({ syncError: errorMessage });
      return null;
    }
  },

  addItem: async (product, quantity = 1) => {
    const { ensureCart, serverItems, productCache, items } = get();

    // Cache the full product data
    const newCache = new Map(productCache);
    newCache.set(product.id, product);

    // Optimistic update - add item to local state immediately
    const existingItemIndex = items.findIndex(
      (item) => item.product.id === product.id
    );
    let optimisticItems: CartItem[];
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      optimisticItems = items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // Add new item
      optimisticItems = [...items, { product, quantity }];
    }

    set({
      isSyncing: true,
      syncError: null,
      productCache: newCache,
      items: optimisticItems,
    });

    try {
      const cartId = await ensureCart();
      if (!cartId) {
        throw new Error("Failed to get cart");
      }

      // Check if item already exists on server
      const existingServerItem = serverItems.find(
        (item) => item.productId === product.id
      );

      let updatedCart: CartResponse;

      if (existingServerItem) {
        // Update existing item quantity
        const newQuantity = existingServerItem.quantity + quantity;
        updatedCart = await cartApiService.updateItem(
          cartId,
          existingServerItem.id,
          newQuantity
        );
      } else {
        // Add new item
        updatedCart = await cartApiService.addItem(cartId, product.id, quantity);
      }

      // Update local state from server response, using cached product data
      const currentCache = get().productCache;
      set({
        serverItems: updatedCart.items,
        items: mapCartItemsWithCache(updatedCart.items, currentCache),
      });
    } catch (error) {
      // Rollback optimistic update on error
      const currentCache = get().productCache;
      const currentServerItems = get().serverItems;
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add item";
      set({
        syncError: errorMessage,
        items: mapCartItemsWithCache(currentServerItems, currentCache),
      });
    } finally {
      set({ isSyncing: false });
    }
  },

  removeItem: async (productId) => {
    const { serverCartId, serverItems, productCache, items } = get();

    if (!serverCartId) {
      set({ items: [], serverItems: [] });
      return;
    }

    const serverItem = serverItems.find((item) => item.productId === productId);
    if (!serverItem) {
      return;
    }

    // Optimistic update - remove item immediately
    const optimisticItems = items.filter(
      (item) => item.product.id !== productId
    );

    set({ isSyncing: true, syncError: null, items: optimisticItems });

    try {
      const updatedCart = await cartApiService.removeItem(
        serverCartId,
        serverItem.id
      );

      // Remove from cache
      const newCache = new Map(productCache);
      newCache.delete(productId);

      set({
        serverItems: updatedCart.items,
        productCache: newCache,
        items: mapCartItemsWithCache(updatedCart.items, newCache),
      });
    } catch (error) {
      // Rollback optimistic update on error
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove item";
      set({
        syncError: errorMessage,
        items: mapCartItemsWithCache(serverItems, productCache),
      });
    } finally {
      set({ isSyncing: false });
    }
  },

  updateQuantity: async (productId, quantity) => {
    const { serverCartId, serverItems, removeItem, productCache, items } = get();

    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    if (!serverCartId) {
      return;
    }

    const serverItem = serverItems.find((item) => item.productId === productId);
    if (!serverItem) {
      return;
    }

    // Optimistic update - update quantity immediately
    const optimisticItems = items.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );

    set({ isSyncing: true, syncError: null, items: optimisticItems });

    try {
      const updatedCart = await cartApiService.updateItem(
        serverCartId,
        serverItem.id,
        quantity
      );

      set({
        serverItems: updatedCart.items,
        items: mapCartItemsWithCache(updatedCart.items, productCache),
      });
    } catch (error) {
      // Rollback optimistic update on error
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update quantity";
      set({
        syncError: errorMessage,
        items: mapCartItemsWithCache(serverItems, productCache),
      });
    } finally {
      set({ isSyncing: false });
    }
  },

  incrementQuantity: async (productId) => {
    const { serverItems, updateQuantity } = get();
    const item = serverItems.find((i) => i.productId === productId);
    if (item) {
      await updateQuantity(productId, item.quantity + 1);
    }
  },

  decrementQuantity: async (productId) => {
    const { serverItems, updateQuantity, removeItem } = get();
    const item = serverItems.find((i) => i.productId === productId);
    if (item) {
      if (item.quantity <= 1) {
        await removeItem(productId);
      } else {
        await updateQuantity(productId, item.quantity - 1);
      }
    }
  },

  clearCart: () =>
    set({
      items: [],
      serverCartId: null,
      serverItems: [],
      productCache: new Map<string, Product>(),
      syncError: null,
    }),

  syncWithServer: async () => {
    const { serverCartId, ensureCart, productCache } = get();

    set({ isSyncing: true, syncError: null });

    try {
      const cartId = serverCartId || (await ensureCart());
      if (!cartId) {
        return null;
      }

      const cart = await cartApiService.getById(cartId);

      // Check if cart is still usable
      if (cart.status !== "OPEN") {
        // Need a new cart
        const newCart = await cartApiService.create();
        set({
          serverCartId: newCart.id,
          serverItems: newCart.items,
          items: [],
          productCache: new Map<string, Product>(),
        });
        return newCart;
      }

      // Fetch full product data for items not in cache
      const updatedCache = await fetchMissingProductsForCart(
        cart.items,
        productCache
      );

      set({
        serverCartId: cart.id,
        serverItems: cart.items,
        productCache: updatedCache,
        items: mapCartItemsWithCache(cart.items, updatedCache),
      });

      return cart;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sync cart";
      set({ syncError: errorMessage });
      return null;
    } finally {
      set({ isSyncing: false });
    }
  },

  loadFromServer: async (cartId: string) => {
    const { productCache } = get();
    set({ isSyncing: true, syncError: null });

    try {
      const cart = await cartApiService.getById(cartId);

      // Fetch full product data for items not in cache
      const updatedCache = await fetchMissingProductsForCart(
        cart.items,
        productCache
      );

      set({
        serverCartId: cart.id,
        serverItems: cart.items,
        productCache: updatedCache,
        items: mapCartItemsWithCache(cart.items, updatedCache),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load cart";
      set({ syncError: errorMessage });
    } finally {
      set({ isSyncing: false });
    }
  },

  // Computed getters
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
