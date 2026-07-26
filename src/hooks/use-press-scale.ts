import { useCallback, useRef } from "react";
import { Animated } from "react-native";

export type UsePressScaleOptions = {
  /**
   * Scale the element animates to while pressed. iOS Liquid Glass controls
   * *grow* on press (values > 1) and spring back on release; pass a value < 1
   * for controls that should depress instead (e.g. a camera shutter).
   */
  pressedScale?: number;
};

export type UsePressScaleResult = {
  scale: Animated.Value;
  /** 0 = idle, 1 = pressed. Drive a (white) highlight overlay's opacity with this. */
  highlight: Animated.Value;
  onPressIn: () => void;
  onPressOut: () => void;
};

/**
 * iOS Liquid Glass "interactive" tap feel: the control grows slightly and
 * brightens on press, then springs back with a little bounce on release.
 * Mirrors `.glassEffect(.regular.interactive())` (scale + touch illumination).
 * Uses the RN `Animated` API (native driver) for consistency across the app.
 */
export const usePressScale = ({
  pressedScale = 1.1,
}: UsePressScaleOptions = {}): UsePressScaleResult => {
  const scale = useRef(new Animated.Value(1)).current;
  const highlight = useRef(new Animated.Value(0)).current;

  const onPressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: pressedScale,
        useNativeDriver: true,
        speed: 45,
        bounciness: 0,
      }),
      Animated.timing(highlight, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [highlight, pressedScale, scale]);

  const onPressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 12,
      }),
      Animated.timing(highlight, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [highlight, scale]);

  return { scale, highlight, onPressIn, onPressOut };
};
