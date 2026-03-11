import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { COLORS } from "@/constants/layout";

interface IconProps {
  size: number;
  color?: string;
}

export function DropletIcon({ size, color = COLORS.primary }: IconProps) {
  return <Ionicons name="water-outline" size={size} color={color} />;
}

export function CheckCircleIcon({ size, color = COLORS.primary }: IconProps) {
  return <Feather name="check-circle" size={size} color={color} />;
}

export function ScaleIcon({ size, color = COLORS.primary }: IconProps) {
  return <MaterialCommunityIcons name="scale-balance" size={size} color={color} />;
}

export function ChevronLeftIcon({ size, color = COLORS.text }: IconProps) {
  return <Feather name="chevron-left" size={size} color={color} />;
}

export function DollarIcon({ size, color = COLORS.surface }: IconProps) {
  return <Feather name="dollar-sign" size={size} color={color} />;
}

export function TipJarIcon({ size, color = COLORS.surface }: IconProps) {
  return <MaterialCommunityIcons name="hand-coin-outline" size={size} color={color} />;
}

export function TruckIcon({ size, color = COLORS.surface }: IconProps) {
  return <Feather name="truck" size={size} color={color} />;
}

export function PackageIcon({ size, color = COLORS.surface }: IconProps) {
  return <Feather name="package" size={size} color={color} />;
}

export function PlusIcon({ size, color = COLORS.surface }: IconProps) {
  return <Feather name="plus" size={size} color={color} />;
}

export function BellIcon({ size, color = COLORS.text }: IconProps) {
  return <Feather name="bell" size={size} color={color} />;
}

export function ChatIcon({ size, color = COLORS.surface }: IconProps) {
  return <Ionicons name="chatbubble-outline" size={size} color={color} />;
}
