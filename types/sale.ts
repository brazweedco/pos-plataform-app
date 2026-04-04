/**
 * Sale Types
 * Types for sales/transactions
 */

// Sale item in a transaction
export interface SaleItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weightGrams: number;
}

// Full sale response from API
export interface SaleResponse {
  id: string;
  saleNumber: string;
  tenantId: string;
  customerName?: string;
  status: SaleStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  items: SaleItemResponse[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  total: number;
  totalWeight: number;
  itemCount: number;
  notes?: string;
  voidReason?: string;
  createdAt: string;
  completedAt?: string;
  voidedAt?: string;
}

export type SaleStatus = "PENDING" | "COMPLETED" | "VOIDED" | "REFUNDED";

export type PaymentMethod = "CASH" | "TAP_TO_PAY";

// Sales summary for dashboard/reports
export interface SaleSummaryResponse {
  date: string;
  totalSales: number;
  completedCount: number;
  voidedCount: number;
  totalRevenue: number;
  totalTax: number;
  totalTips: number;
  averageOrderValue: number;
  topSellingProducts: TopSellingProduct[];
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

// Request to complete a sale
export interface CompleteSaleRequest {
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  tipAmount?: number;
  notes?: string;
}

// Request to void a sale
export interface VoidSaleRequest {
  reason: string;
}

// Paginated sales response
export interface SalesPageResponse {
  content: SaleResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
