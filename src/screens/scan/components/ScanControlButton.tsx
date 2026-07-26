import type Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { AppText, GlassIconButton } from "@/components";

export type ScanControlButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress: () => void;
};

/** Secondary camera control (Gallery / Manual) on liquid glass. */
export const ScanControlButton = ({
  icon,
  label,
  accessibilityLabel,
  disabled = false,
  onPress,
}: ScanControlButtonProps) => {
  return (
    <View
      className="w-20 items-center gap-1.5"
      style={{ opacity: disabled ? 0.45 : 1 }}
    >
      <GlassIconButton
        accessibilityLabel={accessibilityLabel ?? label}
        disabled={disabled}
        icon={icon}
        iconColor="#ffffff"
        iconSize={22}
        intensity={28}
        size={48}
        surfaceClassName="border-white/25"
        tint="dark"
        tintColor="rgba(255,255,255,0.18)"
        onPress={onPress}
      />
      <AppText className="text-xs font-medium text-white/90">{label}</AppText>
    </View>
  );
};
