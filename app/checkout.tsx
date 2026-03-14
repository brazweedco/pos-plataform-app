import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/ui";
import { SquarePaymentForm } from "@/components/square-payment-form";
import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { TEXT_SIZES } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";
import { useCheckout } from "@/hooks/use-checkout";
import { useCartStore } from "@/stores/cart-store";
import { PaymentMethod } from "@/types/sale";

type PaymentOption = {
  id: PaymentMethod;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "CASH",
    label: "Cash",
    icon: "dollar-sign",
    description: "Pay with cash",
  },
  {
    id: "CARD",
    label: "Card",
    icon: "credit-card",
    description: "Pay with credit or debit card",
  },
];

export default function CheckoutScreen() {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();

  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotal = useCartStore((state) => state.getTotal);

  const {
    state: checkoutState,
    startCheckout,
    processCardToken,
    cancelPaymentForm,
    isProcessing,
  } = useCheckout();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("CASH");
  const [tip, setTip] = useState("");

  const subtotal = getSubtotal();
  const tipAmount = parseFloat(tip) || 0;
  const total = getTotal() + tipAmount;

  const handleCheckout = async () => {
    await startCheckout(selectedPayment, tipAmount);
  };

  const handleCardPaymentSuccess = async (
    token: string,
    cardBrand?: string,
    lastFour?: string
  ) => {
    await processCardToken(token, cardBrand, lastFour);
  };

  const handleCardPaymentError = (error: string) => {
    cancelPaymentForm();
  };

  const getStepMessage = () => {
    switch (checkoutState.step) {
      case "checking_out":
        return "Creating sale...";
      case "awaiting_card":
        return "Enter card details...";
      case "processing_payment":
        return "Processing payment...";
      case "completing":
        return "Completing sale...";
      default:
        return "";
    }
  };

  const renderOrderItem = ({
    item,
  }: {
    item: (typeof items)[0];
  }) => (
    <View
      style={[
        styles.orderItem,
        {
          paddingVertical: sy(12),
          borderBottomWidth: 1,
          borderBottomColor: "#E4E4E7",
        },
      ]}
    >
      <View style={styles.itemInfo}>
        <Text
          style={[styles.itemName, { fontSize: s(TEXT_SIZES.body) }]}
          numberOfLines={1}
        >
          {item.product.name}
        </Text>
        <Text
          style={[styles.itemQuantity, { fontSize: s(TEXT_SIZES.bodySmall) }]}
        >
          Qty: {item.quantity}
        </Text>
      </View>
      <Text style={[styles.itemPrice, { fontSize: s(TEXT_SIZES.body) }]}>
        ${(item.product.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <ScreenContainer showPattern={false}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <ScreenHeader title="Checkout" onBack={() => router.back()} />
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { marginTop: sy(20), paddingHorizontal: sx(20) }]}>
          <Text style={[styles.sectionTitle, { fontSize: s(TEXT_SIZES.sectionTitle) }]}>
            Order Summary
          </Text>
          <View
            style={[
              styles.orderCard,
              {
                marginTop: sy(12),
                borderRadius: s(12),
                padding: sx(16),
              },
            ]}
          >
            <FlatList
              data={items}
              keyExtractor={(item) => item.product.id}
              renderItem={renderOrderItem}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Tip Section */}
        <View style={[styles.section, { marginTop: sy(20), paddingHorizontal: sx(20) }]}>
          <Text style={[styles.sectionTitle, { fontSize: s(TEXT_SIZES.sectionTitle) }]}>
            Add Tip (Optional)
          </Text>
          <View
            style={[
              styles.tipInputContainer,
              {
                marginTop: sy(12),
                height: sy(56),
                borderRadius: s(12),
                paddingHorizontal: sx(16),
              },
            ]}
          >
            <Text style={[styles.dollarSign, { fontSize: s(TEXT_SIZES.body) }]}>$</Text>
            <TextInput
              style={[styles.tipInput, { fontSize: s(TEXT_SIZES.body) }]}
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              value={tip}
              onChangeText={setTip}
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { marginTop: sy(20), paddingHorizontal: sx(20) }]}>
          <Text style={[styles.sectionTitle, { fontSize: s(TEXT_SIZES.sectionTitle) }]}>
            Payment Method
          </Text>
          <View style={{ marginTop: sy(12), gap: sy(12) }}>
            {PAYMENT_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.paymentOption,
                  {
                    borderRadius: s(12),
                    padding: sx(16),
                    borderWidth: 2,
                    borderColor:
                      selectedPayment === option.id
                        ? COLORS.primary
                        : "#E4E4E7",
                  },
                ]}
                onPress={() => setSelectedPayment(option.id)}
              >
                <View
                  style={[
                    styles.paymentIconContainer,
                    {
                      width: s(44),
                      height: s(44),
                      borderRadius: s(12),
                      backgroundColor:
                        selectedPayment === option.id
                          ? "rgba(228, 108, 69, 0.1)"
                          : "#F7F5F3",
                    },
                  ]}
                >
                  <Feather
                    name={option.icon}
                    size={s(22)}
                    color={
                      selectedPayment === option.id
                        ? COLORS.primary
                        : COLORS.text
                    }
                  />
                </View>
                <View style={styles.paymentInfo}>
                  <Text
                    style={[
                      styles.paymentLabel,
                      { fontSize: s(TEXT_SIZES.body) },
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.paymentDescription,
                      { fontSize: s(TEXT_SIZES.bodySmall) },
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    {
                      width: s(24),
                      height: s(24),
                      borderRadius: s(12),
                      borderWidth: 2,
                      borderColor:
                        selectedPayment === option.id
                          ? COLORS.primary
                          : "#E4E4E7",
                    },
                  ]}
                >
                  {selectedPayment === option.id && (
                    <View
                      style={[
                        styles.radioButtonInner,
                        {
                          width: s(12),
                          height: s(12),
                          borderRadius: s(6),
                        },
                      ]}
                    />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Error Message */}
        {checkoutState.error && (
          <View style={[styles.errorContainer, { marginHorizontal: sx(20), marginTop: sy(16) }]}>
            <Feather name="alert-circle" size={s(18)} color="#DC2626" />
            <Text style={[styles.errorText, { fontSize: s(TEXT_SIZES.bodySmall) }]}>
              {checkoutState.error}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View
          style={[
            styles.footer,
            {
              paddingHorizontal: sx(20),
              paddingTop: sy(16),
              paddingBottom: insets.bottom + sy(20),
              borderRadius: s(12),
            },
          ]}
        >
          {/* Subtotal */}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontSize: s(TEXT_SIZES.bodySmall) }]}>
              Subtotal
            </Text>
            <Text style={[styles.summaryValue, { fontSize: s(TEXT_SIZES.bodySmall) }]}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>

          {/* Tip */}
          {tipAmount > 0 && (
            <View style={[styles.summaryRow, { marginTop: sy(8) }]}>
              <Text style={[styles.summaryLabel, { fontSize: s(TEXT_SIZES.bodySmall) }]}>
                Tip
              </Text>
              <Text style={[styles.summaryValue, { fontSize: s(TEXT_SIZES.bodySmall) }]}>
                ${tipAmount.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Divider */}
          <View style={[styles.divider, { marginVertical: sy(12) }]} />

          {/* Total */}
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { fontSize: s(TEXT_SIZES.subtotalAmount) }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { fontSize: s(TEXT_SIZES.subtotalAmount) }]}>
              ${total.toFixed(2)}
            </Text>
          </View>

          {/* Processing Message */}
          {isProcessing && (
            <View style={[styles.processingContainer, { marginTop: sy(12) }]}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={[styles.processingText, { fontSize: s(TEXT_SIZES.bodySmall) }]}>
                {getStepMessage()}
              </Text>
            </View>
          )}

          {/* Checkout Button */}
          <View style={{ marginTop: sy(16) }}>
            <Button
              title={isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
              onPress={handleCheckout}
              disabled={isProcessing || items.length === 0}
            />
          </View>
        </View>
      </View>

      {/* Square Payment Form Modal */}
      <SquarePaymentForm
        visible={checkoutState.showPaymentForm}
        amount={checkoutState.total}
        onSuccess={handleCardPaymentSuccess}
        onCancel={cancelPaymentForm}
        onError={handleCardPaymentError}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 8,
    paddingBottom: 20,
  },
  section: {},
  sectionTitle: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  itemQuantity: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  itemPrice: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  tipInputContainer: {
    backgroundColor: COLORS.inputBackground,
    flexDirection: "row",
    alignItems: "center",
  },
  dollarSign: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    marginRight: 4,
  },
  tipInput: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  paymentOption: {
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentLabel: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  paymentDescription: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  radioButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    backgroundColor: COLORS.primary,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: "#DC2626",
    fontFamily: FONTS.regular,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#71717B",
    fontFamily: FONTS.regular,
  },
  summaryValue: {
    color: "#71717B",
    fontFamily: FONTS.regular,
  },
  divider: {
    height: 1,
    backgroundColor: "#E4E4E7",
  },
  totalLabel: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  totalValue: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  processingText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
});
