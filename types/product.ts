import { Brand } from "./brand";
import { Category } from "./category";
import { ProductType } from "./product-type";

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  brand?: Brand;
  category?: Category;
  productType?: ProductType;
  weightGrams?: number;
  thcPercentage?: number;
  cbdPercentage?: number;
  imageUrl?: string;
  active: boolean;
  stock: number;
  image: string; // Computed from imageUrl or placeholder
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  sku: string;
  name: string;
  description?: string;
  brandId?: string;
  categoryId?: string;
  productTypeId?: string;
  price: number;
  weightGrams?: number;
  thcPercentage?: number;
  cbdPercentage?: number;
  imageUrl?: string;
}

export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  description?: string;
  brand?: Brand;
  category?: Category;
  productType?: ProductType;
  price: number;
  weightGrams?: number;
  thcPercentage?: number;
  cbdPercentage?: number;
  imageUrl?: string;
  active: boolean;
  stock?: {
    quantity: number;
    unit: string;
    lowStockAlert: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type StockStatus = {
  color: string;
  text: string;
};

export const LOW_STOCK_THRESHOLD = 20;

export function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return { color: "#FF541C", text: "Out of stock" };
  if (stock <= LOW_STOCK_THRESHOLD) return { color: "#FF541C", text: `${stock} in stock` };
  return { color: "#00953E", text: `${stock} in stock` };
}

export function mapProductResponseToProduct(response: ProductResponse): Product {
  return {
    id: response.id,
    name: response.name,
    sku: response.sku,
    description: response.description,
    price: response.price,
    brand: response.brand,
    category: response.category,
    productType: response.productType,
    weightGrams: response.weightGrams,
    thcPercentage: response.thcPercentage,
    cbdPercentage: response.cbdPercentage,
    imageUrl: response.imageUrl,
    active: response.active,
    stock: response.stock?.quantity ?? 0,
    image: response.imageUrl || "https://via.placeholder.com/200",
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };
}
