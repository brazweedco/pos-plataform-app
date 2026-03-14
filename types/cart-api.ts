/**
 * Cart API Types
 * Types for server-side cart operations
 */

// Cart item response from API
export interface CartItemResponse {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
}

// Full cart response from API
export interface CartResponse {
  id: string;
  customerName?: string;
  status: CartStatus;
  items: CartItemResponse[];
  subtotal: number;
  totalDiscount: number;
  createdAt: string;
  updatedAt: string;
}

export type CartStatus = "OPEN" | "CHECKED_OUT" | "ABANDONED";

// Request to create a new cart
export interface CreateCartRequest {
  customerName?: string;
}

// Request to add item to cart
export interface AddItemRequest {
  productId: string;
  quantity: number;
}

// Request to update item quantity
export interface UpdateItemRequest {
  quantity: number;
}

// Checkout response
export interface CheckoutResponse {
  saleId: string;
  saleNumber: string;
  cartId: string;
  total: number;
  status: string;
  message: string;
}
