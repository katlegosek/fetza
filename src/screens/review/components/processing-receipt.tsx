import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { AppText, RECEIPT_ZIGZAG_DEPTH, ReceiptZigzagRow } from "@/components";
import { RECEIPT_MONOSPACE_FONT_FAMILY } from "@/lib/helper";
import { ReceiptDiscoveryPill } from "@/screens/review/components/receipt-discovery-pill";
import { ReceiptScanOverlay } from "@/screens/review/components/receipt-scan-overlay";
import { ReceiptSkeletonRow } from "@/screens/review/components/receipt-skeleton-row";
import type {
  PROCESSING_DEMO_RECEIPT,
  ProcessingReceiptVisibility,
} from "@/screens/review/receipt-processing-stages";
import { formatMoneyFromCents } from "@/utils/money";

const PAPER = "#f4f1e8";
const INK = "#1c1917";
const MUTED_INK = "#57534e";
const RECEIPT_ZIGZAG_TOOTH = 12;

const styles = StyleSheet.create({
  zigzagAnchor: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
});

type DemoReceipt = typeof PROCESSING_DEMO_RECEIPT;

export const ProcessingReceipt = ({
  width,
  receipt,
  visibility,
  discoveryPill,
  processing,
}: {
  width: number;
  receipt: DemoReceipt;
  visibility: ProcessingReceiptVisibility;
  discoveryPill: string | null;
  processing: boolean;
}) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 750,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: 750,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const skeletonOpacity = useMemo(
    () =>
      pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.35, 0.78],
      }),
    [pulse],
  );
  const teethCount = Math.max(1, Math.floor(width / RECEIPT_ZIGZAG_TOOTH));

  return (
    <View
      className="shadow-xl shadow-emerald-950/15"
      style={{ position: "relative", flexShrink: 0, width }}
    >
      <ReceiptDiscoveryPill label={discoveryPill} />

      <View
        pointerEvents="none"
        style={[styles.zigzagAnchor, { top: -RECEIPT_ZIGZAG_DEPTH + 0.5 }]}
      >
        <ReceiptZigzagRow teethCount={teethCount} color={PAPER} pointUp />
      </View>

      <View
        className={
          visibility.tableReady
            ? "overflow-hidden border-x border-emerald-400/40 px-4 pb-5 pt-3"
            : "overflow-hidden border-x border-black/[0.08] px-4 pb-5 pt-3"
        }
        style={{ backgroundColor: PAPER, width }}
      >
        <ReceiptScanOverlay active={processing} />

        <AppText
          className="text-center text-[11px] uppercase tracking-[0.35em]"
          style={{
            color: MUTED_INK,
            fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
          }}
        >
          * * *
        </AppText>

        {visibility.merchant ? (
          <>
            <AppText
              className="mt-3 text-center text-[15px] font-bold uppercase leading-snug tracking-wide"
              style={{
                color: INK,
                fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
              }}
            >
              {receipt.merchant}
            </AppText>
            <AppText
              className="mt-2 text-center text-[11px]"
              style={{
                color: MUTED_INK,
                fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
              }}
            >
              {receipt.timestamp}
            </AppText>
          </>
        ) : (
          <View className="items-center gap-2 py-4">
            <Animated.View
              className="h-4 w-48 rounded-full bg-stone-300"
              style={{ opacity: skeletonOpacity }}
            />
            <Animated.View
              className="h-2.5 w-28 rounded-full bg-stone-300"
              style={{ opacity: skeletonOpacity }}
            />
          </View>
        )}

        <View className="my-3 border-t border-dashed border-stone-400/90" />

        <View className="mb-1 flex-row items-end justify-between border-b border-stone-400/40 pb-1">
          <AppText
            className="flex-1 pr-2 text-[10px] uppercase tracking-wider"
            style={{
              color: MUTED_INK,
              fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
            }}
          >
            Item
          </AppText>
          <AppText
            className="w-9 text-right text-[10px] uppercase"
            style={{
              color: MUTED_INK,
              fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
            }}
          >
            Qty
          </AppText>
          <AppText
            className="w-[5.5rem] text-right text-[10px] uppercase"
            style={{
              color: MUTED_INK,
              fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
            }}
          >
            Total
          </AppText>
        </View>

        {receipt.items.map((item) =>
          visibility.items ? (
            <View
              className="flex-row items-center gap-1 border-b border-stone-400/25 py-2.5"
              key={item.id}
            >
              <AppText
                className="flex-1 pr-2 text-[13px] leading-snug"
                numberOfLines={2}
                style={{
                  color: INK,
                  fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                }}
              >
                {item.description}
              </AppText>
              <AppText
                className="w-9 text-right text-[13px]"
                style={{
                  color: INK,
                  fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                }}
              >
                {item.quantity}
              </AppText>
              {visibility.prices ? (
                <AppText
                  className="w-[5.5rem] text-right text-[13px]"
                  style={{
                    color: INK,
                    fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {formatMoneyFromCents(item.totalCents)}
                </AppText>
              ) : (
                <Animated.View
                  className="h-3 w-[5rem] rounded-full bg-stone-300"
                  style={{ opacity: skeletonOpacity }}
                />
              )}
            </View>
          ) : (
            <ReceiptSkeletonRow key={item.id} opacity={skeletonOpacity} />
          ),
        )}

        <View className="my-3 border-t border-dashed border-stone-400/90" />

        {visibility.fees
          ? receipt.adjustments.map((row) => (
              <View
                className="flex-row items-center justify-between py-0.5"
                key={row.id}
              >
                <AppText
                  style={{
                    color: MUTED_INK,
                    fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                  }}
                >
                  {row.label}
                </AppText>
                <AppText
                  style={{
                    color: INK,
                    fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {formatMoneyFromCents(row.amountCents)}
                </AppText>
              </View>
            ))
          : [0, 1, 2].map((row) => (
              <ReceiptSkeletonRow
                compact
                key={`fee-${row}`}
                opacity={skeletonOpacity}
              />
            ))}

        <View
          className={
            visibility.total
              ? "mt-3 flex-row items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-50/60 px-2 py-2"
              : "mt-3 flex-row items-center justify-between border-t border-stone-900/15 pt-2"
          }
        >
          <AppText
            className="font-bold"
            style={{ color: INK, fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY }}
          >
            TOTAL
          </AppText>
          {visibility.total ? (
            <AppText
              className="font-bold"
              style={{
                color: INK,
                fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                fontVariant: ["tabular-nums"],
              }}
            >
              {formatMoneyFromCents(receipt.totalCents)}
            </AppText>
          ) : (
            <Animated.View
              className="h-4 w-24 rounded-full bg-stone-300"
              style={{ opacity: skeletonOpacity }}
            />
          )}
        </View>

        <AppText
          className="mt-5 text-center text-[9px] uppercase tracking-[0.24em]"
          style={{
            color: MUTED_INK,
            fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
          }}
        >
          Fetza is building your shared bill
        </AppText>
      </View>

      <View
        pointerEvents="none"
        style={[styles.zigzagAnchor, { bottom: -RECEIPT_ZIGZAG_DEPTH + 0.5 }]}
      >
        <ReceiptZigzagRow teethCount={teethCount} color={PAPER} />
      </View>
    </View>
  );
};
