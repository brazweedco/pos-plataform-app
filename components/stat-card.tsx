import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/layout";
import { FONTS } from "@/constants/fonts";
import { FONT_SIZES } from "@/constants/typography";
import { useScale } from "@/hooks/use-scale";

interface StatCardProps {
  title: string;
  value: string | ReactNode;
  icon: ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  const { s, sx, sy } = useScale();

  return (
    <View
      style={[
        styles.card,
        {
          height: sy(92),
          borderRadius: s(12),
          paddingHorizontal: sx(15),
          paddingVertical: sy(21),
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            width: s(50),
            height: s(50),
            borderRadius: s(8),
          },
        ]}
      >
        {icon}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { fontSize: s(FONT_SIZES.md) }]}>{title}</Text>
        {typeof value === "string" ? (
          <Text style={[styles.value, { fontSize: s(FONT_SIZES["2xl"]) }]}>{value}</Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(241, 112, 73, 0.25)",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 15,
    elevation: 4,
  },
  content: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  value: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
    marginTop: 2,
  },
});
