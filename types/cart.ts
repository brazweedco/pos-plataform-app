import { Product } from "./product";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
}

export const LEGAL_LIMIT_GRAMS = 30;
