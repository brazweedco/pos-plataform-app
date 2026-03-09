export interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  category: string;
  stock: number;
  image: string;
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
