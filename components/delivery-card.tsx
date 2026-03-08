import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/layout";
import { useScale } from "@/hooks/use-scale";

interface DeliveryCardProps {
  orderId: string;
  status: string;
  time: string;
  price: string;
  onPress?: () => void;
}

export function DeliveryCard({
  orderId,
  status,
  time,
  price,
  onPress,
}: DeliveryCardProps) {
  const { s, sx, sy } = useScale();

  return (
    <Pressable
      style={[
        styles.card,
        {
          height: sy(77),
          borderRadius: s(12),
          paddingHorizontal: sx(19),
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { width: s(24), height: s(24) }]}>
        <Feather name="truck" size={s(24)} color={COLORS.primary} />
      </View>
      <View style={[styles.content, { marginLeft: sx(26) }]}>
        <Text style={[styles.orderId, { fontSize: s(18) }]}>{orderId}</Text>
        <Text style={[styles.status, { fontSize: s(14), marginTop: sy(2) }]}>
          {status} • {time}
        </Text>
      </View>
      <Text style={[styles.price, { fontSize: s(17) }]}>{price}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
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
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  orderId: {
    color: COLORS.text,
    fontWeight: "600",
  },
  status: {
    color: "#9F9FA9",
    fontWeight: "500",
  },
  price: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
