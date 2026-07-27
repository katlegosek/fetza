import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import { useThemeColors } from "@/hooks";
import { cn } from "@/lib/cn";
import { canUseLiquidGlass } from "@/lib/liquid-glass";

export type GlassIconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  iconColor?: string;
  /** Fallback BlurView tint on older iOS. */
  tint?: "light" | "dark" | "default";
  /** Fallback BlurView strength on older iOS. */
  intensity?: number;
  disabled?: boolean;
  /** Extra classes for the (circular) glass surface, e.g. border tint. */
  surfaceClassName?: string;
  /** Optional tint for the native iOS 26 Liquid Glass material. */
  tintColor?: string;
  /** Solid Material fallback color on Android/web. Defaults to the theme surface. */
  materialBackgroundColor?: string;
  /** Android elevation for the Material fallback. */
  materialElevation?: number;
  /**
   * When `false`, renders the glass as a static visual (no own `Pressable`) so
   * it can act as an anchor for a native menu that owns the tap gesture.
   */
  interactive?: boolean;
};

/** Resolved once per app run — the OS/material support doesn't change at runtime. */
const LIQUID_GLASS_AVAILABLE = canUseLiquidGlass();

/**
 * Circular "liquid glass" control. Uses Apple's genuine Liquid Glass material
 * (`expo-glass-effect`) on iOS 26+, a native BlurView on older iOS, and a
 * solid elevated Material control on Android. Android deliberately does not
 * imitate Apple's Liquid Glass interaction.
 *
 * Availability checks both compile-time Liquid Glass support and the runtime
 * Glass Effect API (some iOS 26 betas lack the API and would crash otherwise).
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
      isInteractive={interactive && !disabled}
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

/** Older iOS: frosted blur. Android/web: solid elevated Material control. */
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
  interactive = true,
  tintColor,
  materialBackgroundColor,
  materialElevation = 3,
}: GlassIconButtonProps) => {
  const colors = useThemeColors();
  const useFrostedBlur = Platform.OS === "ios";
  const fallbackBackground =
    materialBackgroundColor ??
    tintColor ??
    (tint === "dark" ? "#27272a" : colors.background);

  const surface = (
    <View
      className={cn(
        "overflow-hidden rounded-full border border-borderSubtle",
        surfaceClassName,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: useFrostedBlur ? undefined : fallbackBackground,
        elevation: Platform.OS === "android" ? materialElevation : undefined,
        shadowColor: Platform.OS === "android" ? "#000000" : undefined,
      }}
    >
      {useFrostedBlur ? (
        <>
          <BlurView
            intensity={intensity}
            tint={tint}
            style={StyleSheet.absoluteFill}
          />
          {tintColor ? (
            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { backgroundColor: tintColor }]}
            />
          ) : null}
        </>
      ) : null}
      <View className="flex-1 items-center justify-center">
        <Ionicons name={icon} size={iconSize} color={iconColor} />
      </View>
    </View>
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
      accessibilityState={{ disabled }}
      android_ripple={{
        color: tint === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)",
        borderless: false,
      }}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => ({
        borderRadius: size / 2,
        opacity: disabled ? 0.5 : 1,
        overflow: "hidden",
        transform:
          Platform.OS === "ios" && pressed ? [{ scale: 0.96 }] : undefined,
      })}
      onPress={onPress}
    >
      {surface}
    </Pressable>
  );
};
