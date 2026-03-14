/**
 * Sales API Service
 * Handles all sales/transaction-related API operations
 */

import { api } from "./api";
import {
  SaleResponse,
  SaleSummaryResponse,
  SalesPageResponse,
  CompleteSaleRequest,
  VoidSaleRequest,
  PaymentMethod,
} from "@/types/sale";

export const salesService = {
  /**
   * List sales with pagination
   */
  async list(
    page: number = 0,
    size: number = 20,
    status?: string
  ): Promise<SalesPageResponse> {
    let endpoint = `/api/v1/sales?page=${page}&size=${size}`;
    if (status) {
      endpoint += `&status=${status}`;
    }
    const response = await api.get<SalesPageResponse>(endpoint);
    return response.data;
  },

  /**
   * Get sale by ID
   */
  async getById(saleId: string): Promise<SaleResponse> {
    const response = await api.get<SaleResponse>(`/api/v1/sales/${saleId}`);
    return response.data;
  },

  /**
   * Get sales summary for a date (or today if not specified)
   */
  async getSummary(date?: string): Promise<SaleSummaryResponse> {
    let endpoint = "/api/v1/sales/summary";
    if (date) {
      endpoint += `?date=${date}`;
    }
    const response = await api.get<SaleSummaryResponse>(endpoint);
    return response.data;
  },

  /**
   * Complete a pending sale with payment info
   */
  async complete(
    saleId: string,
    paymentMethod: PaymentMethod,
    options?: {
      paymentReference?: string;
      tipAmount?: number;
      notes?: string;
    }
  ): Promise<SaleResponse> {
    const body: CompleteSaleRequest = {
      paymentMethod,
      ...options,
    };
    const response = await api.post<SaleResponse>(
      `/api/v1/sales/${saleId}/complete`,
      body
    );
    return response.data;
  },

  /**
   * Void a sale
   */
  async void(saleId: string, reason: string): Promise<SaleResponse> {
    const body: VoidSaleRequest = { reason };
    const response = await api.post<SaleResponse>(
      `/api/v1/sales/${saleId}/void`,
      body
    );
    return response.data;
  },

  /**
   * Get today's sales
   */
  async getToday(): Promise<SalesPageResponse> {
    const today = new Date().toISOString().split("T")[0];
    const response = await api.get<SalesPageResponse>(
      `/api/v1/sales?date=${today}&size=100`
    );
    return response.data;
  },
};
