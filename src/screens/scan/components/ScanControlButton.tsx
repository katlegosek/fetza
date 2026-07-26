import Ionicons from "@expo/vector-icons/Ionicons";
import { Animated, Pressable, StyleSheet } from "react-native";

import { AppText } from "@/components";
import { usePressScale } from "@/hooks";

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
}: ScanControlButtonProps) => {
  const { scale, highlight, onPressIn, onPressOut } = usePressScale();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      className="w-20 items-center gap-1.5"
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        className="size-12 items-center justify-center overflow-hidden rounded-2xl bg-white/15"
        style={{ transform: [{ scale }] }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(255,255,255,0.35)", opacity: highlight },
          ]}
        />
        <Ionicons name={icon} size={22} color="#ffffff" />
      </Animated.View>
      <AppText className="text-xs font-medium text-white/90">{label}</AppText>
    </Pressable>
  );
};
