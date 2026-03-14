/**
 * useCheckout Hook
 * Encapsulates checkout logic for cart -> sale conversion
 * Payment processing uses Square Web Payments SDK for card payments
 */

import { useState, useCallback } from "react";
import { router } from "expo-router";

import { useCartStore } from "@/stores/cart-store";
import { cartApiService } from "@/services/cart-api";
import { salesService } from "@/services/sales";
import { squarePaymentService, PaymentStatus } from "@/services/square-pos";
import { PaymentMethod } from "@/types/sale";
import { CheckoutResponse } from "@/types/cart-api";

export type CheckoutStep =
  | "idle"
  | "checking_out"
  | "awaiting_card"
  | "processing_payment"
  | "completing"
  | "completed"
  | "error";

export interface CheckoutState {
  step: CheckoutStep;
  error: string | null;
  saleId: string | null;
  saleNumber: string | null;
  total: number;
  tipAmount: number;
  paymentMethod: PaymentMethod | null;
  paymentId: string | null;
  paymentStatus: PaymentStatus | null;
  showPaymentForm: boolean;
}

export interface UseCheckoutReturn {
  state: CheckoutState;
  startCheckout: (paymentMethod: PaymentMethod, tip?: number) => Promise<void>;
  processCardToken: (token: string, cardBrand?: string, lastFour?: string) => Promise<void>;
  cancelPaymentForm: () => void;
  reset: () => void;
  cancelPayment: () => Promise<void>;
  isProcessing: boolean;
}

export function useCheckout(): UseCheckoutReturn {
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const serverCartId = useCartStore((state) => state.serverCartId);

  const [state, setState] = useState<CheckoutState>({
    step: "idle",
    error: null,
    saleId: null,
    saleNumber: null,
    total: 0,
    tipAmount: 0,
    paymentMethod: null,
    paymentId: null,
    paymentStatus: null,
    showPaymentForm: false,
  });

  const startCheckout = useCallback(
    async (paymentMethod: PaymentMethod, tip: number = 0) => {
      if (items.length === 0) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: "Cart is empty",
        }));
        return;
      }

      if (!serverCartId) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: "Cart not synced with server",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        step: "checking_out",
        error: null,
        paymentMethod,
        tipAmount: tip,
        total: getTotal() + tip,
      }));

      try {
        const cartId = serverCartId;

        // Step 1: Checkout cart to create pending sale
        const checkoutResult: CheckoutResponse =
          await cartApiService.checkout(cartId);

        const saleTotal = checkoutResult.total + tip;

        setState((prev) => ({
          ...prev,
          saleId: checkoutResult.saleId,
          saleNumber: checkoutResult.saleNumber,
          total: saleTotal,
        }));

        // Step 2: Process payment based on method
        if (paymentMethod === "CARD") {
          // Show Square Payment Form to collect card details
          setState((prev) => ({
            ...prev,
            step: "awaiting_card",
            showPaymentForm: true,
          }));
          // processCardToken will be called when user completes the form
        } else {
          // Cash payment - complete sale directly
          setState((prev) => ({ ...prev, step: "completing" }));

          await salesService.complete(checkoutResult.saleId, paymentMethod, {
            tipAmount: tip > 0 ? tip : undefined,
          });

          setState((prev) => ({ ...prev, step: "completed" }));

          // Clear cart and navigate to success
          clearCart();
          router.replace({
            pathname: "/checkout-success",
            params: {
              saleId: checkoutResult.saleId,
              saleNumber: checkoutResult.saleNumber,
              total: saleTotal.toString(),
            },
          });
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: error instanceof Error ? error.message : "Checkout failed",
          showPaymentForm: false,
        }));
      }
    },
    [items, getTotal, serverCartId, clearCart]
  );

  /**
   * Process card payment with token from Square Web Payments SDK
   * Called by SquarePaymentForm when user submits card details
   */
  const processCardToken = useCallback(
    async (token: string, cardBrand?: string, lastFour?: string) => {
      if (!state.saleId) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: "No sale to process",
          showPaymentForm: false,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        step: "processing_payment",
        showPaymentForm: false,
      }));

      try {
        const paymentResult = await squarePaymentService.processCardPayment(
          state.saleId,
          token,
          state.total,
          {
            tipAmount: state.tipAmount > 0 ? state.tipAmount : undefined,
            notes: `Sale #${state.saleNumber}`,
          }
        );

        if (paymentResult.status === "COMPLETED") {
          setState((prev) => ({
            ...prev,
            paymentId: paymentResult.id,
            paymentStatus: paymentResult.status,
            step: "completed",
          }));

          // Clear cart and navigate to success
          clearCart();
          router.replace({
            pathname: "/checkout-success",
            params: {
              saleId: state.saleId,
              saleNumber: state.saleNumber || "",
              total: state.total.toString(),
              cardBrand: cardBrand || "",
              lastFour: lastFour || "",
            },
          });
        } else if (paymentResult.status === "FAILED") {
          setState((prev) => ({
            ...prev,
            step: "error",
            error: paymentResult.errorMessage || "Payment failed",
          }));
        } else {
          // Payment is pending/processing - mark as completed for now
          setState((prev) => ({
            ...prev,
            paymentId: paymentResult.id,
            paymentStatus: paymentResult.status,
            step: "completed",
          }));

          clearCart();
          router.replace({
            pathname: "/checkout-success",
            params: {
              saleId: state.saleId,
              saleNumber: state.saleNumber || "",
              total: state.total.toString(),
              cardBrand: cardBrand || "",
              lastFour: lastFour || "",
            },
          });
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: error instanceof Error ? error.message : "Payment failed",
        }));
      }
    },
    [state.saleId, state.saleNumber, state.total, state.tipAmount, clearCart]
  );

  /**
   * Cancel the payment form without completing the sale
   */
  const cancelPaymentForm = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: "error",
      error: "Payment cancelled",
      showPaymentForm: false,
    }));
  }, []);

  const cancelPayment = useCallback(async () => {
    if (state.paymentId) {
      try {
        await squarePaymentService.cancelPayment(state.paymentId);
      } catch (error) {
        console.error("Failed to cancel payment:", error);
      }
    }
    reset();
  }, [state.paymentId]);

  const reset = useCallback(() => {
    setState({
      step: "idle",
      error: null,
      saleId: null,
      saleNumber: null,
      total: 0,
      tipAmount: 0,
      paymentMethod: null,
      paymentId: null,
      paymentStatus: null,
      showPaymentForm: false,
    });
  }, []);

  const isProcessing =
    state.step === "checking_out" ||
    state.step === "processing_payment" ||
    state.step === "completing";

  return {
    state,
    startCheckout,
    processCardToken,
    cancelPaymentForm,
    reset,
    cancelPayment,
    isProcessing,
  };
}
