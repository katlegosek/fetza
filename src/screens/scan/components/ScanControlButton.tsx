import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { AppText } from "@/components";

export type ScanControlButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress: () => void;
};

/** Secondary camera control (Gallery / Manual) styled for the dark preview overlay. */
export const ScanControlButton = ({
  icon,
  label,
  accessibilityLabel,
  disabled = false,
  onPress,
}: ScanControlButtonProps) => (
  <Pressable
    accessibilityLabel={accessibilityLabel ?? label}
    accessibilityRole="button"
    className="w-20 items-center gap-1.5 active:opacity-60"
    disabled={disabled}
    onPress={onPress}
  >
    <View className="size-12 items-center justify-center rounded-2xl bg-white/15">
      <Ionicons name={icon} size={22} color="#ffffff" />
    </View>
    <AppText className="text-xs font-medium text-white/90">{label}</AppText>
  </Pressable>
);
