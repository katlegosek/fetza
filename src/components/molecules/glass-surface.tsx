import { BlurView } from "expo-blur";
import { type GlassStyle, GlassView } from "expo-glass-effect";
import type { ReactNode } from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

import { cn } from "@/lib/cn";
import { canUseLiquidGlass } from "@/lib/liquid-glass";

export type GlassSurfaceProps = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Native liquid glass style (iOS 26+). */
  glassEffectStyle?: GlassStyle;
  /** Tint for the native glass material. */
  tintColor?: string;
  /** Fallback BlurView tint. */
  blurTint?: "light" | "dark" | "default";
  /** Fallback BlurView intensity. */
  blurIntensity?: number;
  /**
   * Extra classes for the fallback surface only (borders / fills that would
   * fight the native glass material).
   */
  fallbackClassName?: string;
};

const LIQUID_GLASS = canUseLiquidGlass();

/**
 * Panel/chip surface that uses real Liquid Glass on iOS 26+ and a BlurView
 * recreation elsewhere — for search fields, floating bars, status pills, etc.
 */
export const GlassSurface = ({
  children,
  className,
  style,
  glassEffectStyle = "regular",
  tintColor,
  blurTint = "light",
  blurIntensity = 40,
  fallbackClassName,
}: GlassSurfaceProps) => {
  if (LIQUID_GLASS) {
    return (
      <GlassView
        className={className}
        glassEffectStyle={glassEffectStyle}
        style={style}
        tintColor={tintColor}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      className={cn("overflow-hidden", className, fallbackClassName)}
      style={style}
    >
      <BlurView
        intensity={blurIntensity}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        tint={blurTint}
      />
      {children}
    </View>
  );
};
