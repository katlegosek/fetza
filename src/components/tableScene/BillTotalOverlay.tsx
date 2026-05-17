import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import type { TableTheme } from "./tableThemes";

type BillTotalOverlayProps = {
  theme: TableTheme;
  total: string;
  itemCount: number;
  onPress?: () => void;
};

export function BillTotalOverlay({
  theme,
  total,
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
        accessibilityLabel={`Bill total ${total}, ${itemCount} items`}
        accessibilityRole="button"
        disabled={!onPress}
        hitSlop={8}
        onPress={onPress}
        style={styles.stack}
      >
        <Text style={[styles.labelSmall, { color: theme.mutedTextColor }]}>
          Bill total
        </Text>
        <Text style={[styles.amount, { color: theme.textColor }]}>{total}</Text>
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
