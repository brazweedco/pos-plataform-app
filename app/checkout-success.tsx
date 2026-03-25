import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { TEXT_SIZES, FONT_SIZES } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";

export default function CheckoutSuccessScreen() {
  const { s, sx, sy } = useScale();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    saleId: string;
    saleNumber: string;
    total: string;
  }>();

  const total = parseFloat(params.total || "0");

  const handleNewSale = () => {
    router.replace("/products");
  };

  const handleViewReceipt = () => {
    // TODO: Navigate to receipt/sale details
    router.push(`/orders`);
  };

  return (
    <ScreenContainer showPattern={false}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + sy(40),
            paddingBottom: insets.bottom + sy(20),
            paddingHorizontal: sx(20),
          },
        ]}
      >
        {/* Success Icon */}
        <View style={styles.iconSection}>
          <View
            style={[
              styles.iconOuterRing,
              {
                width: s(160),
                height: s(160),
                borderRadius: s(80),
              },
            ]}
          >
            <View
              style={[
                styles.iconInnerRing,
                {
                  width: s(120),
                  height: s(120),
                  borderRadius: s(60),
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    width: s(80),
                    height: s(80),
                    borderRadius: s(40),
                  },
                ]}
              >
                <Feather name="check" size={s(40)} color={COLORS.surface} />
              </View>
            </View>
          </View>
        </View>

        {/* Success Message */}
        <View style={[styles.messageSection, { marginTop: sy(40) }]}>
          <Text
            style={[
              styles.successTitle,
              { fontSize: s(FONT_SIZES["3xl"]) },
            ]}
          >
            Payment Successful
          </Text>
          <Text
            style={[
              styles.successSubtitle,
              { fontSize: s(TEXT_SIZES.body), marginTop: sy(12) },
            ]}
          >
            The transaction has been completed successfully
          </Text>
        </View>

        {/* Receipt Card */}
        <View
          style={[
            styles.receiptCard,
            {
              marginTop: sy(40),
              borderRadius: s(16),
              padding: sx(24),
            },
          ]}
        >
          {/* Sale Number */}
          <View style={styles.receiptRow}>
            <Text
              style={[styles.receiptLabel, { fontSize: s(TEXT_SIZES.body) }]}
            >
              Sale Number
            </Text>
            <Text
              style={[styles.receiptValue, { fontSize: s(TEXT_SIZES.body) }]}
            >
              #{params.saleNumber || "---"}
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { marginVertical: sy(16) }]} />

          {/* Total Paid */}
          <View style={styles.receiptRow}>
            <Text
              style={[
                styles.totalLabel,
                { fontSize: s(TEXT_SIZES.sectionTitle) },
              ]}
            >
              Total Paid
            </Text>
            <Text
              style={[
                styles.totalValue,
                { fontSize: s(FONT_SIZES["2xl"]) },
              ]}
            >
              ${total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <Button title="Start New Sale" onPress={handleNewSale} />

          <View style={{ marginTop: sy(12) }}>
            <Button
              title="View Orders"
              variant="secondary"
              onPress={handleViewReceipt}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconSection: {
    alignItems: "center",
  },
  iconOuterRing: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconInnerRing: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  messageSection: {
    alignItems: "center",
  },
  successTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    textAlign: "center",
  },
  successSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    textAlign: "center",
    maxWidth: 280,
  },
  receiptCard: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
  receiptValue: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  totalLabel: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  totalValue: {
    color: "#22C55E",
    fontFamily: FONTS.bold,
  },
  buttonSection: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
