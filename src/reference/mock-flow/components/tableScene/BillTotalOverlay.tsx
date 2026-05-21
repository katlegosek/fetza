import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { AnimatedZarAmount } from "@/components/atoms/animated-zar-amount";
import { formatZAR } from "@/lib/helper";

import type { TableTheme } from "./tableThemes";

type BillTotalOverlayProps = {
  theme: TableTheme;
  totalCents: number;
  itemCount: number;
  onPress?: () => void;
};

export function BillTotalOverlay({
  theme,
  totalCents,
  itemCount,
  onPress,
}: BillTotalOverlayProps) {
  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFillObject, styles.centered]}
    >
      <Pressable
        accessibilityHint="Bill total and item count"
        accessibilityLabel={`Bill total ${formatZAR(totalCents)}, ${itemCount} items`}
        accessibilityRole="button"
        disabled={!onPress}
        hitSlop={8}
        onPress={onPress}
        style={styles.stack}
      >
        <Text style={[styles.labelSmall, { color: theme.mutedTextColor }]}>
          Bill total
        </Text>
        <AnimatedZarAmount
          cents={totalCents}
          style={[styles.amount, { color: theme.textColor }]}
        />
        <Text style={[styles.meta, { color: theme.mutedTextColor }]}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </Text>
        {onPress ? (
          <View
            style={[
              styles.cta,
              { backgroundColor: "#FFFFFF", borderColor: theme.borderSoft },
            ]}
          >
            <Text style={[styles.ctaText, { color: theme.textColor }]}>
              Tap for details
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    zIndex: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  stack: {
    alignItems: "center",
    paddingHorizontal: 12,
    maxWidth: 200,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: "600",
  },
  amount: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  meta: {
    marginTop: 4,
    fontSize: 11,
  },
  cta: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  ctaText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
