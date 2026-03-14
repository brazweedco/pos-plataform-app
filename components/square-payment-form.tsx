/**
 * Square Payment Form Component
 * Uses iframe on web and WebView on native for card tokenization
 * Requires HTTPS for Square Web Payments SDK
 */

import { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Pressable,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { useScale } from "@/hooks/use-scale";

// Square Sandbox credentials
const SQUARE_APP_ID =
  process.env.EXPO_PUBLIC_SQUARE_APPLICATION_ID ||
  "sandbox-sq0idb-XXXXXXXXXXXXXXXXXXXXXXXX";
const SQUARE_LOCATION_ID =
  process.env.EXPO_PUBLIC_SQUARE_LOCATION_ID || "LXXXXXXXXXXXXXXXX";

interface SquarePaymentFormProps {
  visible: boolean;
  amount: number;
  onSuccess: (token: string, cardBrand?: string, lastFour?: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export function SquarePaymentForm({
  visible,
  amount,
  onSuccess,
  onCancel,
  onError,
}: SquarePaymentFormProps) {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build the URL for the payment form
  const getPaymentFormUrl = () => {
    const params = new URLSearchParams({
      amount: amount.toString(),
      appId: SQUARE_APP_ID,
      locationId: SQUARE_LOCATION_ID,
    });
    // Use the same origin for the payment form
    return `/square-payment.html?${params.toString()}`;
  };

  // Handle messages from iframe (web only)
  useEffect(() => {
    if (!visible || Platform.OS !== "web") return;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (typeof data !== "object" || !data.type) return;

      switch (data.type) {
        case "READY":
          setLoading(false);
          break;
        case "TOKEN_SUCCESS":
          onSuccess(data.token, data.cardBrand, data.lastFour);
          break;
        case "TOKEN_ERROR":
          onError(data.error || "Failed to process card");
          break;
        case "CANCEL":
          onCancel();
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [visible, onSuccess, onError, onCancel]);

  // Reset loading state when modal opens
  useEffect(() => {
    if (visible) {
      setLoading(true);
    }
  }, [visible]);

  // Web platform - use iframe with src (not srcdoc)
  if (Platform.OS === "web") {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                maxWidth: sx(440),
                maxHeight: sy(600),
                borderRadius: s(16),
                marginTop: insets.top + sy(40),
              },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.header,
                { paddingHorizontal: sx(20), paddingVertical: sy(16) },
              ]}
            >
              <Text style={[styles.headerTitle, { fontSize: s(18) }]}>
                Secure Payment
              </Text>
              <Pressable onPress={onCancel} hitSlop={10}>
                <Feather name="x" size={s(24)} color={COLORS.text} />
              </Pressable>
            </View>

            {/* Loading indicator */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading payment form...</Text>
              </View>
            )}

            {/* Iframe - loads from same origin with HTTPS */}
            <iframe
              ref={iframeRef}
              src={getPaymentFormUrl()}
              style={{
                flex: 1,
                width: "100%",
                border: "none",
                backgroundColor: COLORS.background,
                display: loading ? "none" : "block",
              }}
              title="Square Payment Form"
            />
          </View>
        </View>
      </Modal>
    );
  }

  // Native platforms - use WebView
  const WebView = require("react-native-webview").WebView;

  // For native, we need to use a full URL with HTTPS
  // In production, this would be your hosted payment page
  const getNativePaymentUrl = () => {
    const params = new URLSearchParams({
      amount: amount.toString(),
      appId: SQUARE_APP_ID,
      locationId: SQUARE_LOCATION_ID,
    });
    // For native, you'd need to host this page somewhere with HTTPS
    // For now, we'll use a local approach with injected HTML
    return null;
  };

  // Generate HTML for WebView (native only - has secure context)
  const generateNativeHtml = () => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>Payment</title>
  <script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #FEF9F3;
      padding: 20px;
      min-height: 100vh;
    }
    .amount { font-size: 28px; font-weight: 700; color: #E46C45; text-align: center; margin-bottom: 32px; }
    .form-group { margin-bottom: 20px; }
    .label { display: block; font-size: 14px; font-weight: 500; color: #0F2F38; margin-bottom: 8px; }
    #card-container { min-height: 90px; }
    .error-message { color: #DC2626; font-size: 13px; margin-top: 8px; display: none; }
    .error-message.visible { display: block; }
    .button { width: 100%; padding: 18px; border-radius: 16px; font-size: 16px; font-weight: 600; cursor: pointer; border: none; margin-top: 16px; }
    .button-primary { background-color: #E46C45; color: white; }
    .button-primary:disabled { background-color: #E4E4E7; color: #808080; }
    .button-secondary { background-color: transparent; color: #0F2F38; border: 1px solid #E4E4E7; }
    .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #E4E4E7; border-top-color: #E46C45; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { margin-top: 16px; color: #808080; font-size: 14px; }
    .secure-badge { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 20px; color: #808080; font-size: 12px; }
  </style>
</head>
<body>
  <div id="loading" class="loading">
    <div class="spinner"></div>
    <p class="loading-text">Loading secure payment form...</p>
  </div>
  <div id="payment-form" style="display: none;">
    <div class="amount">$${amount.toFixed(2)}</div>
    <div class="form-group">
      <label class="label">Card Details</label>
      <div id="card-container"></div>
      <p id="card-error" class="error-message"></p>
    </div>
    <button id="pay-button" class="button button-primary" disabled>Pay $${amount.toFixed(2)}</button>
    <button id="cancel-button" class="button button-secondary">Cancel</button>
    <div class="secure-badge">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      Secured by Square
    </div>
  </div>
  <script>
    const appId = '${SQUARE_APP_ID}';
    const locationId = '${SQUARE_LOCATION_ID}';
    let card;

    async function initializePayments() {
      try {
        const payments = Square.payments(appId, locationId);
        card = await payments.card({
          style: {
            '.input-container': { borderColor: '#E4E4E7', borderRadius: '12px' },
            '.input-container.is-focus': { borderColor: '#E46C45' },
            '.input-container.is-error': { borderColor: '#DC2626' },
            input: { backgroundColor: '#F7F5F3', color: '#0F2F38' },
            'input::placeholder': { color: '#808080' },
          }
        });
        await card.attach('#card-container');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('payment-form').style.display = 'block';
        document.getElementById('pay-button').disabled = false;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TOKEN_ERROR', error: e.message }));
      }
    }

    async function handlePayment() {
      const payButton = document.getElementById('pay-button');
      const errorElement = document.getElementById('card-error');
      payButton.disabled = true;
      payButton.textContent = 'Processing...';
      errorElement.classList.remove('visible');
      try {
        const result = await card.tokenize();
        if (result.status === 'OK') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'TOKEN_SUCCESS',
            token: result.token,
            cardBrand: result.details?.card?.brand,
            lastFour: result.details?.card?.last4,
          }));
        } else {
          const errorMsg = result.errors?.map(e => e.message).join(', ') || 'Card processing failed';
          errorElement.textContent = errorMsg;
          errorElement.classList.add('visible');
          payButton.disabled = false;
          payButton.textContent = 'Pay $${amount.toFixed(2)}';
        }
      } catch (e) {
        errorElement.textContent = e.message || 'Payment failed';
        errorElement.classList.add('visible');
        payButton.disabled = false;
        payButton.textContent = 'Pay $${amount.toFixed(2)}';
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
      initializePayments();
      document.getElementById('pay-button').addEventListener('click', handlePayment);
      document.getElementById('cancel-button').addEventListener('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CANCEL' }));
      });
    });
  </script>
</body>
</html>
  `;

  const handleNativeMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case "READY":
          setLoading(false);
          break;
        case "TOKEN_SUCCESS":
          onSuccess(data.token, data.cardBrand, data.lastFour);
          break;
        case "TOKEN_ERROR":
          onError(data.error || "Failed to process card");
          break;
        case "CANCEL":
          onCancel();
          break;
      }
    } catch (e) {
      console.error("WebView message error:", e);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View
          style={[
            styles.header,
            { paddingHorizontal: sx(20), paddingVertical: sy(16) },
          ]}
        >
          <Text style={[styles.headerTitle, { fontSize: s(18) }]}>
            Secure Payment
          </Text>
          <Pressable onPress={onCancel} hitSlop={10}>
            <Feather name="x" size={s(24)} color={COLORS.text} />
          </Pressable>
        </View>

        <WebView
          source={{ html: generateNativeHtml() }}
          style={styles.webview}
          onMessage={handleNativeMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
          originWhitelist={["*"]}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    width: "90%",
    backgroundColor: COLORS.background,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7",
  },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingOverlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
});
