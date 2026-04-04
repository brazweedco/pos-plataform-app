/**
 * Stripe Terminal Service
 * Handles Tap to Pay (NFC) payments using Stripe Terminal SDK
 */

import { api } from "./api";

export interface ConnectionTokenResponse {
  secret: string;
}

export const stripeTerminalApi = {
  /**
   * Fetches a connection token from the backend
   * Required by Stripe Terminal SDK to authenticate
   */
  fetchConnectionToken: async (): Promise<string> => {
    const response = await api.post<ConnectionTokenResponse>(
      "/api/v1/stripe/terminal/connection-token",
      {}
    );
    return response.secret;
  },
};
