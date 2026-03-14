/**
 * Square Payment Service
 * Frontend service for Square Web Payments SDK integration
 *
 * Flow:
 * 1. Frontend uses SquarePaymentForm component to collect card and get token
 * 2. Token is sent to backend via createPayment
 * 3. Backend processes payment with Square Payments API
 */

import { api } from "./api";

// Payment request to send to backend
export interface SquarePaymentRequest {
  saleId: string;
  amount: number;
  tipAmount?: number;
  notes?: string;
  sourceId: string; // Card token from Square Web Payments SDK (required for card payments)
  customerEmail?: string;
}

// Payment response from backend
export interface SquarePaymentResponse {
  id: string;
  saleId: string;
  status: PaymentStatus;
  amount: number;
  tipAmount: number;
  totalAmount: number;
  squarePaymentId?: string;
  squareReceiptUrl?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

/**
 * Square Payment Service
 * All payment processing is handled by the backend
 */
export const squarePaymentService = {
  /**
   * Create a payment for a sale using a card token from Square Web Payments SDK
   * The frontend generates the token via SquarePaymentForm component
   * Backend processes the payment with Square Payments API
   */
  async createPayment(request: SquarePaymentRequest): Promise<SquarePaymentResponse> {
    const response = await api.post<SquarePaymentResponse>(
      `/api/v1/payments/square`,
      request
    );
    return response.data;
  },

  /**
   * Get payment status by ID
   */
  async getPayment(paymentId: string): Promise<SquarePaymentResponse> {
    const response = await api.get<SquarePaymentResponse>(
      `/api/v1/payments/${paymentId}`
    );
    return response.data;
  },

  /**
   * Get payment by sale ID
   */
  async getPaymentBySale(saleId: string): Promise<SquarePaymentResponse> {
    const response = await api.get<SquarePaymentResponse>(
      `/api/v1/payments/sale/${saleId}`
    );
    return response.data;
  },

  /**
   * Cancel a pending payment
   */
  async cancelPayment(paymentId: string): Promise<SquarePaymentResponse> {
    const response = await api.post<SquarePaymentResponse>(
      `/api/v1/payments/${paymentId}/cancel`
    );
    return response.data;
  },

  /**
   * Process a card payment with a token from Square Web Payments SDK
   *
   * @param saleId - The sale ID to process payment for
   * @param sourceId - Card token from SquarePaymentForm
   * @param amount - Payment amount
   * @param options - Optional tip, notes, etc.
   */
  async processCardPayment(
    saleId: string,
    sourceId: string,
    amount: number,
    options?: {
      tipAmount?: number;
      notes?: string;
      customerEmail?: string;
    }
  ): Promise<SquarePaymentResponse> {
    return this.createPayment({
      saleId,
      sourceId,
      amount,
      tipAmount: options?.tipAmount,
      notes: options?.notes,
      customerEmail: options?.customerEmail,
    });
  },
};

export default squarePaymentService;
