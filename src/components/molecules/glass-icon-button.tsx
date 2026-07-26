import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import { usePressScale } from "@/hooks";
import { cn } from "@/lib/cn";

export type GlassIconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  iconColor?: string;
  /** Fallback (BlurView) blur tint on older iOS / Android. */
  tint?: "light" | "dark" | "default";
  /** Fallback (BlurView) blur strength. */
  intensity?: number;
  disabled?: boolean;
  /** Extra classes for the (circular) glass surface, e.g. border tint. */
  surfaceClassName?: string;
  /** Overlay color flashed on press (fallback path). */
  highlightColor?: string;
  /** Optional tint for the native iOS 26 Liquid Glass material. */
  tintColor?: string;
  /**
   * When `false`, renders the glass as a static visual (no own `Pressable`) so
   * it can act as an anchor for a native menu that owns the tap gesture.
   */
  interactive?: boolean;
};

/** Resolved once per app run — the OS/material support doesn't change at runtime. */
const LIQUID_GLASS_AVAILABLE = isLiquidGlassAvailable();

/**
 * Circular "liquid glass" control. Uses Apple's genuine Liquid Glass material
 * (`expo-glass-effect`) on iOS 26+, which handles the grow/brighten/spring
 * interaction natively, and falls back to a BlurView recreation everywhere else
 * (older iOS + Android) — the same native-first strategy WhatsApp uses.
 */
export const GlassIconButton = (props: GlassIconButtonProps) =>
  LIQUID_GLASS_AVAILABLE ? (
    <NativeGlassIconButton {...props} />
  ) : (
    <FallbackGlassIconButton {...props} />
  );

/** iOS 26+ path: real `UIGlassEffect` with system-driven interactive feedback. */
const NativeGlassIconButton = ({
  icon,
  accessibilityLabel,
  onPress,
  size = 44,
  iconSize = 22,
  iconColor = "#ffffff",
  disabled = false,
  tintColor,
  interactive = true,
}: GlassIconButtonProps) => {
  const glass = (
    // Icon lives *inside* the glass so it scales/brightens with the native
    // interactive effect instead of sitting on top as a static overlay.
    <GlassView
      glassEffectStyle="regular"
      isInteractive
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
      tintColor={tintColor}
    >
      <Ionicons name={icon} size={iconSize} color={iconColor} />
    </GlassView>
  );

  if (!interactive) {
    return (
      <View accessibilityLabel={accessibilityLabel} accessibilityRole="button">
        {glass}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
    >
      {glass}
    </Pressable>
  );
};

/** Older iOS / Android path: BlurView + a hand-rolled grow/brighten/spring. */
const FallbackGlassIconButton = ({
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
  interactive = true,
}: GlassIconButtonProps) => {
  const { scale, highlight, onPressIn, onPressOut } = usePressScale();

  // iOS Liquid Glass brightens (fills toward white) at the touch point, so dark
  // icons stay legible as the surface lights up.
  const pressColor = highlightColor ?? "rgba(255,255,255,0.6)";

  const surface = (
    <Animated.View
      className={cn(
        "overflow-hidden rounded-full border border-white/25",
        surfaceClassName,
      )}
      style={{
        width: size,
        height: size,
        transform: [{ scale: interactive ? scale : 1 }],
      }}
    >
      <BlurView
        intensity={intensity}
        tint={tint}
        style={StyleSheet.absoluteFill}
      />
      {interactive ? (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: pressColor, opacity: highlight },
          ]}
        />
      ) : null}
      <View className="flex-1 items-center justify-center">
        <Ionicons name={icon} size={iconSize} color={iconColor} />
      </View>
    </Animated.View>
  );

  if (!interactive) {
    return (
      <View accessibilityLabel={accessibilityLabel} accessibilityRole="button">
        {surface}
      </View>
    );
  }

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
      {surface}
    </Pressable>
  );
};
