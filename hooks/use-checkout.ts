/**
 * useCheckout Hook
 * Encapsulates checkout logic for cart -> sale conversion
 * Supports CASH and TAP_TO_PAY (NFC card payments via Stripe Terminal)
 */

import { useState, useCallback } from "react";
import { router } from "expo-router";

import { useCartStore } from "@/stores/cart-store";
import { cartApiService } from "@/services/cart-api";
import { salesService } from "@/services/sales";
import { stripePaymentApi } from "@/services/stripe-payment";
import { PaymentMethod } from "@/types/sale";
import { CheckoutResponse } from "@/types/cart-api";

export type CheckoutStep =
  | "idle"
  | "checking_out"
  | "awaiting_payment"
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
}

export interface UseCheckoutReturn {
  state: CheckoutState;
  startCheckout: (paymentMethod: PaymentMethod, tip?: number) => Promise<void>;
  processTapToPaySuccess: (paymentIntentId: string) => Promise<void>;
  cancelPaymentForm: () => void;
  reset: () => void;
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
        if (paymentMethod === "TAP_TO_PAY") {
          // Tap to Pay - show the TapToPayButton
          // The actual payment is handled by TapToPayButton component
          // which calls processTapToPaySuccess on completion
          setState((prev) => ({
            ...prev,
            step: "awaiting_payment",
          }));
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
              paymentMethod: "Cash",
            },
          });
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: error instanceof Error ? error.message : "Checkout failed",
        }));
      }
    },
    [items, getTotal, serverCartId, clearCart]
  );

  /**
   * Process Tap to Pay payment success
   * Called by TapToPayButton when payment is confirmed via Stripe Terminal
   */
  const processTapToPaySuccess = useCallback(
    async (paymentIntentId: string) => {
      if (!state.saleId) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: "No sale to process",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        step: "processing_payment",
      }));

      try {
        // Verify payment status with Stripe
        const paymentStatus = await stripePaymentApi.getPaymentIntent(paymentIntentId);

        if (paymentStatus.status === "succeeded") {
          // Complete the sale on backend
          setState((prev) => ({ ...prev, step: "completing" }));

          await salesService.complete(state.saleId, "TAP_TO_PAY", {
            tipAmount: state.tipAmount > 0 ? state.tipAmount : undefined,
            paymentReference: paymentIntentId,
          });

          setState((prev) => ({
            ...prev,
            paymentId: paymentIntentId,
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
              paymentMethod: "Tap to Pay",
            },
          });
        } else {
          setState((prev) => ({
            ...prev,
            step: "error",
            error: `Payment not completed. Status: ${paymentStatus.status}`,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          step: "error",
          error: error instanceof Error ? error.message : "Payment verification failed",
        }));
      }
    },
    [state.saleId, state.saleNumber, state.total, state.tipAmount, clearCart]
  );

  /**
   * Cancel the payment without completing the sale
   */
  const cancelPaymentForm = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: "error",
      error: "Payment cancelled",
    }));
  }, []);

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
    });
  }, []);

  const isProcessing =
    state.step === "checking_out" ||
    state.step === "processing_payment" ||
    state.step === "completing";

  return {
    state,
    startCheckout,
    processTapToPaySuccess,
    cancelPaymentForm,
    reset,
    isProcessing,
  };
}
