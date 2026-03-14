/**
 * Cart API Service
 * Handles all cart-related API operations
 */

import { api } from "./api";
import {
  CartResponse,
  CreateCartRequest,
  AddItemRequest,
  UpdateItemRequest,
  CheckoutResponse,
} from "@/types/cart-api";

export const cartApiService = {
  /**
   * Create a new cart
   */
  async create(customerName?: string): Promise<CartResponse> {
    const body: CreateCartRequest = {};
    if (customerName) {
      body.customerName = customerName;
    }
    const response = await api.post<CartResponse>("/api/v1/carts", body);
    return response.data;
  },

  /**
   * Get cart by ID
   */
  async getById(cartId: string): Promise<CartResponse> {
    const response = await api.get<CartResponse>(`/api/v1/carts/${cartId}`);
    return response.data;
  },

  /**
   * Add item to cart
   */
  async addItem(
    cartId: string,
    productId: string,
    quantity: number
  ): Promise<CartResponse> {
    const body: AddItemRequest = { productId, quantity };
    const response = await api.post<CartResponse>(
      `/api/v1/carts/${cartId}/items`,
      body
    );
    return response.data;
  },

  /**
   * Update item quantity in cart
   */
  async updateItem(
    cartId: string,
    itemId: string,
    quantity: number
  ): Promise<CartResponse> {
    const body: UpdateItemRequest = { quantity };
    const response = await api.put<CartResponse>(
      `/api/v1/carts/${cartId}/items/${itemId}`,
      body
    );
    return response.data;
  },

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, itemId: string): Promise<CartResponse> {
    const response = await api.delete<CartResponse>(
      `/api/v1/carts/${cartId}/items/${itemId}`
    );
    return response.data;
  },

  /**
   * Checkout cart - converts to a pending sale
   */
  async checkout(cartId: string): Promise<CheckoutResponse> {
    const response = await api.post<CheckoutResponse>(
      `/api/v1/carts/${cartId}/checkout`
    );
    return response.data;
  },
};
