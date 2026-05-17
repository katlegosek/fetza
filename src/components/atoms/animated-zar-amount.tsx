import React, { useEffect } from "react";
import { type StyleProp, TextInput, type TextStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export type AnimatedZarAmountProps = {
  /** Amount in cents (usually integer). */
  cents: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  testID?: string;
};

/**
 * Smoothly interpolates the displayed ZAR string when `cents` changes (matches `formatZAR` in @/lib/helper).
 */
export function AnimatedZarAmount({
  cents,
  duration = 350,
  style,
  testID,
}: AnimatedZarAmountProps) {
  const progress = useSharedValue(cents);

  useEffect(() => {
    progress.value = withTiming(cents, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [cents, duration, progress]);

  const animatedProps = useAnimatedProps(() => {
    const roundedCents = Math.round(progress.value);
    const text = `R ${(roundedCents / 100).toFixed(2)}`;
    return { text, defaultValue: text } as unknown as Record<string, string>;
  });

  return (
    <AnimatedTextInput
      accessibilityLiveRegion="polite"
      animatedProps={animatedProps}
      editable={false}
      multiline={false}
      pointerEvents="none"
      testID={testID}
      underlineColorAndroid="transparent"
      style={[{ padding: 0, margin: 0, borderWidth: 0, minWidth: 0 }, style]}
    />
  );
}
