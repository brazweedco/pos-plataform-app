import { api } from "./api";

export interface PaymentIntentRequest {
  saleId: string;
  amount: number;
  currency: string;
}

export interface PaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
}

export interface PaymentIntentStatus {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}

export const stripePaymentApi = {
  /**
   * Creates a PaymentIntent on the backend
   * Returns clientSecret needed for Google Pay confirmation
   */
  createPaymentIntent: async (
    saleId: string,
    amount: number,
    currency: string = "brl"
  ): Promise<PaymentIntentResponse> => {
    return api.post<PaymentIntentResponse>(
      "/api/v1/stripe/payment-intent",
      {
        saleId,
        amount,
        currency,
      }
    );
  },

  /**
   * Gets the current status of a PaymentIntent
   */
  getPaymentIntent: async (
    paymentIntentId: string
  ): Promise<PaymentIntentStatus> => {
    return api.get<PaymentIntentStatus>(
      `/api/v1/stripe/payment-intent/${paymentIntentId}`
    );
  },
};
