/**
 * Tap to Pay Button Component
 * Uses Stripe Terminal SDK to process NFC payments from physical cards
 */

import {
  StripeTerminalProvider,
  useStripeTerminal,
} from "@stripe/stripe-terminal-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { useScale } from "@/hooks/use-scale";
import { stripeTerminalApi } from "@/services/stripe-terminal";
import { stripePaymentApi } from "@/services/stripe-payment";

interface TapToPayButtonProps {
  saleId: string;
  amount: number; // Amount in currency units (e.g., 10.99 for $10.99)
  currency?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

type TapToPayStatus =
  | "idle"
  | "initializing"
  | "ready"
  | "waiting_for_card"
  | "processing"
  | "success"
  | "error";

export function TapToPayButton({
  saleId,
  amount,
  currency = "usd",
  onSuccess,
  onError,
  disabled = false,
}: TapToPayButtonProps) {
  const { s, sx, sy } = useScale();
  const [status, setStatus] = useState<TapToPayStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    initialize,
    isInitialized,
    discoverReaders,
    connectLocalMobileReader,
    retrievePaymentIntent,
    collectPaymentMethod,
    confirmPaymentIntent,
    cancelCollectPaymentMethod,
  } = useStripeTerminal();

  // Initialize terminal on mount
  useEffect(() => {
    const initTerminal = async () => {
      if (isInitialized) {
        setStatus("ready");
        return;
      }

      setStatus("initializing");
      try {
        const { error } = await initialize();
        if (error) {
          console.error("Terminal init error:", error);
          setStatus("error");
          setErrorMessage(error.message || "Failed to initialize terminal");
          return;
        }

        // Discover and connect to local mobile reader (Tap to Pay)
        const { readers, error: discoverError } = await discoverReaders({
          discoveryMethod: "localMobile",
          simulated: __DEV__, // Use simulated reader in development
        });

        if (discoverError) {
          console.error("Discover error:", discoverError);
          setStatus("error");
          setErrorMessage(discoverError.message || "Failed to discover reader");
          return;
        }

        if (!readers || readers.length === 0) {
          setStatus("error");
          setErrorMessage("No Tap to Pay reader available on this device");
          return;
        }

        // Connect to the local mobile reader
        const { reader, error: connectError } = await connectLocalMobileReader({
          reader: readers[0],
          locationId: "tml_FakeLocationId", // In production, use your actual location ID
        });

        if (connectError) {
          console.error("Connect error:", connectError);
          setStatus("error");
          setErrorMessage(connectError.message || "Failed to connect to reader");
          return;
        }

        console.log("Connected to reader:", reader?.serialNumber);
        setStatus("ready");
      } catch (err) {
        console.error("Terminal setup error:", err);
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Terminal setup failed");
      }
    };

    if (Platform.OS !== "web") {
      initTerminal();
    } else {
      setStatus("error");
      setErrorMessage("Tap to Pay is not supported on web");
    }
  }, [initialize, isInitialized, discoverReaders, connectLocalMobileReader]);

  const handleTapToPay = useCallback(async () => {
    if (status !== "ready" || disabled) return;

    setStatus("waiting_for_card");
    setErrorMessage(null);

    try {
      // 1. Create PaymentIntent on backend (server-driven flow)
      const { clientSecret, paymentIntentId } =
        await stripePaymentApi.createPaymentIntent(saleId, amount, currency);

      // 2. Retrieve PaymentIntent in Terminal SDK using clientSecret
      const { paymentIntent, error: retrieveError } = await retrievePaymentIntent(clientSecret);

      if (retrieveError || !paymentIntent) {
        throw new Error(retrieveError?.message || "Failed to retrieve payment intent");
      }

      // 3. Collect payment method (customer taps card on NFC)
      const { paymentIntent: collectedIntent, error: collectError } =
        await collectPaymentMethod({ paymentIntent });

      if (collectError) {
        if (collectError.code === "Canceled") {
          setStatus("ready");
          return;
        }
        throw new Error(collectError.message || "Failed to collect payment");
      }

      if (!collectedIntent) {
        throw new Error("No payment intent after collection");
      }

      setStatus("processing");

      // 4. Confirm the payment
      const { paymentIntent: confirmedIntent, error: confirmError } =
        await confirmPaymentIntent({ paymentIntent: collectedIntent });

      if (confirmError) {
        throw new Error(confirmError.message || "Payment confirmation failed");
      }

      if (confirmedIntent?.status === "succeeded") {
        setStatus("success");
        onSuccess(paymentIntentId);
      } else {
        throw new Error(`Payment not succeeded: ${confirmedIntent?.status}`);
      }
    } catch (err) {
      console.error("Tap to Pay error:", err);
      setStatus("error");
      const message = err instanceof Error ? err.message : "Payment failed";
      setErrorMessage(message);
      onError(message);
    }
  }, [
    status,
    disabled,
    saleId,
    amount,
    currency,
    retrievePaymentIntent,
    collectPaymentMethod,
    confirmPaymentIntent,
    onSuccess,
    onError,
  ]);

  const handleCancel = useCallback(async () => {
    if (status === "waiting_for_card") {
      await cancelCollectPaymentMethod();
      setStatus("ready");
    }
  }, [status, cancelCollectPaymentMethod]);

  // Render based on status
  const renderContent = () => {
    switch (status) {
      case "idle":
      case "initializing":
        return (
          <View style={[styles.button, styles.loadingButton, { height: sy(56), borderRadius: s(12) }]}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={[styles.loadingText, { fontSize: s(16), marginLeft: sx(8) }]}>
              Initializing Tap to Pay...
            </Text>
          </View>
        );

      case "ready":
        return (
          <Pressable
            onPress={handleTapToPay}
            disabled={disabled}
            style={({ pressed }) => [
              styles.button,
              styles.readyButton,
              { height: sy(56), borderRadius: s(12), opacity: pressed ? 0.8 : 1 },
              disabled && styles.disabledButton,
            ]}
          >
            <Feather name="credit-card" size={s(22)} color="#FFFFFF" />
            <Text style={[styles.buttonText, { fontSize: s(16), marginLeft: sx(10) }]}>
              Tap to Pay
            </Text>
          </Pressable>
        );

      case "waiting_for_card":
        return (
          <View style={styles.waitingContainer}>
            <View style={[styles.button, styles.waitingButton, { height: sy(56), borderRadius: s(12) }]}>
              <View style={styles.pulseIndicator}>
                <Feather name="wifi" size={s(24)} color={COLORS.primary} />
              </View>
              <Text style={[styles.waitingText, { fontSize: s(16), marginLeft: sx(10) }]}>
                Waiting for card...
              </Text>
            </View>
            <Pressable
              onPress={handleCancel}
              style={[styles.cancelButton, { marginTop: sy(12), paddingVertical: sy(8) }]}
            >
              <Text style={[styles.cancelText, { fontSize: s(14) }]}>Cancel</Text>
            </Pressable>
          </View>
        );

      case "processing":
        return (
          <View style={[styles.button, styles.processingButton, { height: sy(56), borderRadius: s(12) }]}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={[styles.buttonText, { fontSize: s(16), marginLeft: sx(8) }]}>
              Processing payment...
            </Text>
          </View>
        );

      case "success":
        return (
          <View style={[styles.button, styles.successButton, { height: sy(56), borderRadius: s(12) }]}>
            <Feather name="check-circle" size={s(22)} color="#FFFFFF" />
            <Text style={[styles.buttonText, { fontSize: s(16), marginLeft: sx(8) }]}>
              Payment successful!
            </Text>
          </View>
        );

      case "error":
        return (
          <View style={styles.errorContainer}>
            <View style={[styles.errorBox, { padding: s(12), borderRadius: s(8), marginBottom: sy(12) }]}>
              <Feather name="alert-circle" size={s(18)} color="#DC2626" />
              <Text style={[styles.errorText, { fontSize: s(14), marginLeft: sx(8) }]}>
                {errorMessage || "Payment failed"}
              </Text>
            </View>
            <Pressable
              onPress={() => setStatus("ready")}
              style={({ pressed }) => [
                styles.button,
                styles.retryButton,
                { height: sy(48), borderRadius: s(12), opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="refresh-cw" size={s(18)} color={COLORS.primary} />
              <Text style={[styles.retryText, { fontSize: s(14), marginLeft: sx(8) }]}>
                Try again
              </Text>
            </Pressable>
          </View>
        );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

/**
 * Provider wrapper for Tap to Pay functionality
 * Must wrap components that use TapToPayButton
 */
export function TapToPayProvider({ children }: { children: React.ReactNode }) {
  const fetchTokenProvider = useCallback(async () => {
    try {
      const token = await stripeTerminalApi.fetchConnectionToken();
      return token;
    } catch (error) {
      console.error("Failed to fetch connection token:", error);
      throw error;
    }
  }, []);

  if (Platform.OS === "web") {
    return <>{children}</>;
  }

  return (
    <StripeTerminalProvider
      logLevel="verbose"
      tokenProvider={fetchTokenProvider}
    >
      {children}
    </StripeTerminalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingButton: {
    backgroundColor: COLORS.inputBackground,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
  },
  readyButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: FONTS.semiBold,
  },
  disabledButton: {
    opacity: 0.5,
  },
  waitingContainer: {
    alignItems: "center",
  },
  waitingButton: {
    backgroundColor: "rgba(228, 108, 69, 0.1)",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  pulseIndicator: {
    // Add pulse animation in production
  },
  waitingText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  cancelButton: {
    paddingHorizontal: 16,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
  },
  processingButton: {
    backgroundColor: COLORS.primary,
  },
  successButton: {
    backgroundColor: "#16A34A",
  },
  errorContainer: {
    width: "100%",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220, 38, 38, 0.07)",
  },
  errorText: {
    color: "#DC2626",
    fontFamily: FONTS.regular,
    flex: 1,
  },
  retryButton: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  retryText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
});
