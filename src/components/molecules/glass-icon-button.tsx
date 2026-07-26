import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import { usePressScale } from "@/hooks";
import { cn } from "@/lib/cn";

export type GlassIconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress: () => void;
  size?: number;
  iconSize?: number;
  iconColor?: string;
  tint?: "light" | "dark" | "default";
  intensity?: number;
  disabled?: boolean;
  /** Extra classes for the (circular) glass surface, e.g. border tint. */
  surfaceClassName?: string;
  /** Overlay color flashed on press. Defaults to a tint-appropriate value. */
  highlightColor?: string;
};

/**
 * Circular iOS "liquid glass" control: a translucent blurred surface with a
 * springy press-scale plus a specular highlight flash on tap. Reads best when
 * floating over content, but also holds up on flat backgrounds.
 */
export const GlassIconButton = ({
  icon,
  accessibilityLabel,
  onPress,
  size = 44,
  iconSize = 22,
  iconColor = "#ffffff",
  tint = "dark",
  intensity = 30,
  disabled = false,
  surfaceClassName,
  highlightColor,
}: GlassIconButtonProps) => {
  const { scale, highlight, onPressIn, onPressOut } = usePressScale();

  // iOS Liquid Glass brightens (fills toward white) at the touch point, so dark
  // icons stay legible as the surface lights up.
  const pressColor = highlightColor ?? "rgba(255,255,255,0.6)";

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        className={cn(
          "overflow-hidden rounded-full border border-white/25",
          surfaceClassName,
        )}
        style={{ width: size, height: size, transform: [{ scale }] }}
      >
        <BlurView
          intensity={intensity}
          tint={tint}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: pressColor, opacity: highlight },
          ]}
        />
        <View className="flex-1 items-center justify-center">
          <Ionicons name={icon} size={iconSize} color={iconColor} />
        </View>
      </Animated.View>
    </Pressable>
  );
};
