import {
  PlatformPay,
  PlatformPayButton,
  usePlatformPay,
} from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/layout";
import { useScale } from "@/hooks/use-scale";
import { stripePaymentApi } from "@/services/stripe-payment";

interface GooglePayButtonProps {
  saleId: string;
  amount: number; // Amount in currency units (e.g., 10.99 for R$10.99)
  currency?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function GooglePayButton({
  saleId,
  amount,
  currency = "brl",
  onSuccess,
  onError,
  disabled = false,
}: GooglePayButtonProps) {
  const { s, sy } = useScale();
  const { isPlatformPaySupported, confirmPlatformPayPayment } = usePlatformPay();
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if Google Pay is supported on this device
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const supported = await isPlatformPaySupported({
          googlePay: {
            testEnv: false, // Production mode
          },
        });
        setIsSupported(supported);
      } catch (error) {
        console.log("Google Pay support check failed:", error);
        setIsSupported(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (Platform.OS !== "web") {
      checkSupport();
    } else {
      setIsChecking(false);
      setIsSupported(false);
    }
  }, [isPlatformPaySupported]);

  const handlePay = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);

    try {
      // 1. Create PaymentIntent on backend
      const { clientSecret, paymentIntentId } =
        await stripePaymentApi.createPaymentIntent(saleId, amount, currency);

      // 2. Confirm payment with Google Pay (NFC tap)
      const { error, paymentIntent } = await confirmPlatformPayPayment(
        clientSecret,
        {
          googlePay: {
            testEnv: false, // Production mode
            merchantName: "BrazWeed POS",
            merchantCountryCode: currency.toUpperCase() === "BRL" ? "BR" : "US",
            currencyCode: currency.toUpperCase(),
            billingAddressConfig: {
              format: PlatformPay.BillingAddressFormat.Min,
              isRequired: false,
            },
          },
        }
      );

      if (error) {
        console.error("Google Pay error:", error);
        onError(error.localizedMessage || "Payment failed");
        return;
      }

      // 3. Payment confirmed successfully
      onSuccess(paymentIntent?.id || paymentIntentId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error processing payment";
      console.error("Payment error:", err);
      onError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Still checking support
  if (isChecking) {
    return (
      <View style={[styles.container, { height: sy(56) }]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  // Google Pay not supported on this device
  if (!isSupported) {
    return (
      <View style={[styles.unsupportedContainer, { paddingVertical: sy(12) }]}>
        <Text style={[styles.unsupportedText, { fontSize: s(14) }]}>
          Google Pay not available on this device
        </Text>
      </View>
    );
  }

  // Show loading state while processing
  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { height: sy(56), borderRadius: s(8) },
        ]}
      >
        <ActivityIndicator size="small" color="#FFFFFF" />
        <Text style={[styles.loadingText, { marginLeft: s(8), fontSize: s(16) }]}>
          Processing...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PlatformPayButton
        onPress={handlePay}
        type={PlatformPay.ButtonType.Pay}
        appearance={PlatformPay.ButtonStyle.Black}
        borderRadius={s(8)}
        disabled={disabled}
        style={{
          width: "100%",
          height: sy(56),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  unsupportedContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  unsupportedText: {
    color: "#666666",
    textAlign: "center",
  },
  loadingContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  loadingText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
