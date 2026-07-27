import { BlurView } from "expo-blur";
import { type GlassStyle, GlassView } from "expo-glass-effect";
import type { ReactNode } from "react";
import {
  Platform,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { useThemeColors } from "@/hooks";
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
  /** Solid surface color used by the Android Material fallback. */
  materialBackgroundColor?: string;
  /** Android elevation for floating surfaces. */
  materialElevation?: number;
};

const LIQUID_GLASS = canUseLiquidGlass();

/**
 * Panel/chip surface that uses real Liquid Glass on iOS 26+, BlurView on older
 * iOS, and an elevated Material surface on Android.
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
  materialBackgroundColor,
  materialElevation = 2,
}: GlassSurfaceProps) => {
  const colors = useThemeColors();

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

  if (Platform.OS !== "ios") {
    return (
      <View
        className={cn("overflow-hidden", className, fallbackClassName)}
        style={[
          style,
          {
            backgroundColor:
              materialBackgroundColor ?? tintColor ?? colors.background,
            elevation:
              Platform.OS === "android" ? materialElevation : undefined,
            shadowColor: Platform.OS === "android" ? "#000000" : undefined,
          },
        ]}
      >
        {children}
      </View>
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
