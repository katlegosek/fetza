import { type StyleProp, Text, type TextStyle } from "react-native";

import { formatMoneyFromCents } from "@/utils/money";

export type AnimatedZarAmountProps = {
  /** Amount in cents (usually integer). */
  cents: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  testID?: string;
};

/**
 * Displays a formatted amount without moving currency formatting onto the
 * Reanimated UI thread. Intl.NumberFormat is not worklet-safe on native.
 */
export const AnimatedZarAmount = ({
  cents,
  style,
  testID,
}: AnimatedZarAmountProps) => {
  return (
    <Text
      accessibilityLiveRegion="polite"
      testID={testID}
      style={[{ padding: 0, margin: 0, borderWidth: 0, minWidth: 0 }, style]}
    >
      {formatMoneyFromCents(cents)}
    </Text>
  );
};
