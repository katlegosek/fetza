import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText, FauxBarcode } from "@/components/atoms";
import {
  RECEIPT_ZIGZAG_DEPTH,
  RECEIPT_ZIGZAG_TOOTH,
  ReceiptZigzagRow,
} from "@/components/molecules/receipt-zigzag-row";
import {
  RECEIPT_MONOSPACE_FONT_FAMILY,
  formatZAR,
  sumLineAmountsCents,
} from "@/lib/helper";
import type { DraftBill } from "@/types/draft-bill";

const PAPER = "#f4f1e8";
const INK = "#1c1917";
const INK_MUTED = "#57534e";

const thermalZigzagStyles = StyleSheet.create({
  anchor: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
});

export type ReceiptFeeRow = {
  id?: string;
  label: string;
  amountCents: number;
};

export type ThermalReceiptProps = {
  width: number;
  draft: DraftBill;
  /** When true, renders the same slip as review but without tappable rows or “Add item”. */
  readOnly?: boolean;
  /** When set, renders these rows instead of VAT / service fee (e.g. API adjustments). */
  feeRows?: ReceiptFeeRow[];
  subtotalCents?: number;
  totalCents?: number;
  formatAmount?: (cents: number) => string;
  onMerchantPress: () => void;
  onLinePress: (lineId: string) => void;
  onTotalsPress: () => void;
  onAddLine: () => void;
  /** When feeRows mode is active, tap a fee row (requires row.id). */
  onFeeRowPress?: (adjustmentId: string) => void;
  /** When feeRows mode is active, add a new adjustment line. */
  onAddAdjustment?: () => void;
};

export const ThermalReceipt = ({
  width,
  draft,
  readOnly = false,
  feeRows,
  subtotalCents: subtotalCentsOverride,
  totalCents: totalCentsOverride,
  formatAmount: formatAmountProp,
  onMerchantPress,
  onLinePress,
  onTotalsPress,
  onAddLine,
  onFeeRowPress,
  onAddAdjustment,
}: ThermalReceiptProps) => {
  const formatAmount = formatAmountProp ?? formatZAR;
  const useFeeRows = feeRows !== undefined;
  const editableFeeRows = useFeeRows && !readOnly;

  const subtotal = useMemo(() => {
    if (subtotalCentsOverride !== undefined) {
      return subtotalCentsOverride;
    }

    return sumLineAmountsCents(draft.lines);
  }, [draft.lines, subtotalCentsOverride]);

  const total = useMemo(() => {
    if (totalCentsOverride !== undefined) {
      return totalCentsOverride;
    }

    if (useFeeRows) {
      return (
        subtotal +
        (feeRows?.reduce((sum, row) => sum + row.amountCents, 0) ?? 0)
      );
    }

    return subtotal + draft.vatCents + draft.serviceFeeCents;
  }, [
    draft.serviceFeeCents,
    draft.vatCents,
    feeRows,
    subtotal,
    totalCentsOverride,
    useFeeRows,
  ]);
  const teethCount = Math.max(1, Math.floor(width / RECEIPT_ZIGZAG_TOOTH));

  return (
    <View
      className="shadow-lg shadow-black/25"
      style={{
        position: "relative",
        flexShrink: 0,
        width,
      }}
    >
      <View
        style={[
          thermalZigzagStyles.anchor,
          { top: -RECEIPT_ZIGZAG_DEPTH + 0.5 },
        ]}
        pointerEvents="none"
      >
        <ReceiptZigzagRow teethCount={teethCount} color={PAPER} pointUp />
      </View>

      <View
        className="border-x border-black/[0.08] px-4 pb-5 pt-1"
        style={{ backgroundColor: PAPER, width }}
      >
        <AppText
          className="text-center text-[11px] uppercase tracking-[0.35em]"
          style={{
            color: INK_MUTED,
            fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
          }}
        >
          * * *
        </AppText>

        {readOnly ? (
          <View className="mt-2 py-1">
            <AppText
              className="text-center text-[15px] font-bold uppercase leading-snug tracking-wide"
              style={{ color: INK, fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY }}
              numberOfLines={2}
            >
              {draft.merchant}
            </AppText>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit merchant ${draft.merchant}`}
            onPress={onMerchantPress}
            className="mt-2 rounded-md py-1 active:bg-black/5"
          >
            <AppText
              className="text-center text-[15px] font-bold uppercase leading-snug tracking-wide"
              style={{ color: INK, fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY }}
              numberOfLines={2}
            >
              {draft.merchant}
            </AppText>
          </Pressable>
        )}

        <AppText
          className="mt-1 text-center text-[11px]"
          style={{
            color: INK_MUTED,
            fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
          }}
        >
          * * *
        </AppText>

        <AppText
          className="mt-3 text-center text-[11px]"
          style={{
            color: INK_MUTED,
            fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
          }}
        >
          {draft.timestamp}
        </AppText>

        <View className="my-3 border-t border-dashed border-stone-400/90" />

        <View className="gap-0">
          <View className="mb-1 flex-row items-end justify-between border-b border-stone-400/40 pb-1">
            <AppText
              className="flex-1 pr-2 text-[10px] uppercase tracking-wider"
              style={{
                color: INK_MUTED,
                fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
              }}
            >
              Item
            </AppText>
            <AppText
              className="w-9 text-right text-[10px] uppercase"
              style={{
                color: INK_MUTED,
                fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
              }}
            >
              Qty
            </AppText>
            <AppText
              className="w-[5.5rem] text-right text-[10px] uppercase"
              style={{
                color: INK_MUTED,
                fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
              }}
            >
              Total
            </AppText>
          </View>

          {draft.lines.map((line) =>
            readOnly ? (
              <View
                key={line.id}
                className="flex-row items-center gap-1 border-b border-stone-400/25 py-2.5"
              >
                <AppText
                  className="flex-1 pr-2 text-[13px] leading-snug"
                  style={{
                    color: INK,
                    fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                    fontVariant: ["tabular-nums"],
                  }}
                  numberOfLines={3}
                >
                  {line.description}
                </AppText>
                <AppText
                  className="w-9 shrink-0 text-right text-[13px]"
                  style={{
                    color: INK,
                    fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {line.qty}
                </AppText>
                <AppText
                  className="w-[5.5rem] shrink-0 text-right text-[13px]"
                  style={{
                    color: INK,
                    fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                    fontVariant: ["tabular-nums"],
                  }}
                  numberOfLines={1}
                >
                  {formatAmount(line.amountCents)}
                </AppText>
              </View>
            ) : (
              <Pressable
                key={line.id}
                accessibilityRole="button"
                accessibilityLabel={`Edit line ${line.description}`}
                onPress={() => onLinePress(line.id)}
                className="flex-row items-center gap-1 border-b border-stone-400/25 py-2.5 active:bg-black/[0.04]"
              >
                <AppText
                  className="flex-1 pr-2 text-[13px] leading-snug"
                  style={{
                    color: INK,
                    fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                    fontVariant: ["tabular-nums"],
                  }}
                  numberOfLines={3}
                >
                  {line.description}
                </AppText>
                <AppText
                  className="w-9 shrink-0 text-right text-[13px]"
                  style={{
                    color: INK,
                    fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {line.qty}
                </AppText>
                <AppText
                  className="w-[5.5rem] shrink-0 text-right text-[13px]"
                  style={{
                    color: INK,
                    fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                    fontVariant: ["tabular-nums"],
                  }}
                  numberOfLines={1}
                >
                  {formatAmount(line.amountCents)}
                </AppText>
              </Pressable>
            ),
          )}
        </View>

        {readOnly ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add item"
            onPress={onAddLine}
            className="mt-2 flex-row items-center justify-center gap-2 rounded-lg border border-dashed border-stone-500/60 py-3 active:bg-black/[0.05]"
          >
            <Ionicons name="add" size={18} color={INK_MUTED} />
            <AppText
              className="text-[13px] font-semibold uppercase tracking-wide"
              style={{
                color: INK_MUTED,
                fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
              }}
            >
              Add item
            </AppText>
          </Pressable>
        )}

        <View className="my-3 border-t border-dashed border-stone-400/90" />

        <View className="flex-row justify-between py-0.5">
          <AppText
            style={{
              color: INK_MUTED,
              fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
            }}
          >
            Subtotal
          </AppText>
          <AppText
            style={{
              color: INK,
              fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatAmount(subtotal)}
          </AppText>
        </View>

        {useFeeRows
          ? feeRows?.map((row) => {
              const rowKey = row.id ?? row.label;
              const canPress =
                editableFeeRows && onFeeRowPress !== undefined && row.id;

              const rowContent = (
                <>
                  <AppText
                    style={{
                      color: INK_MUTED,
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
                    {formatAmount(row.amountCents)}
                  </AppText>
                </>
              );

              if (canPress) {
                return (
                  <Pressable
                    key={rowKey}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${row.label}`}
                    className="-mx-1 flex-row items-center justify-between rounded-md px-1 py-0.5 active:bg-black/[0.05]"
                    onPress={() => onFeeRowPress(row.id as string)}
                  >
                    {rowContent}
                  </Pressable>
                );
              }

              return (
                <View
                  key={rowKey}
                  className="-mx-1 flex-row items-center justify-between px-1 py-0.5"
                >
                  {rowContent}
                </View>
              );
            })
          : null}

        {editableFeeRows && onAddAdjustment ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add fee or tax"
            onPress={onAddAdjustment}
            className="-mx-1 mt-1 flex-row items-center justify-center gap-2 rounded-lg border border-dashed border-stone-500/60 py-2 active:bg-black/[0.05]"
          >
            <Ionicons name="add" size={16} color={INK_MUTED} />
            <AppText
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{
                color: INK_MUTED,
                fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
              }}
            >
              Add fee / tax
            </AppText>
          </Pressable>
        ) : null}

        {!useFeeRows && readOnly ? (
          <>
            <View className="-mx-1 flex-row items-center justify-between px-1 py-1">
              <AppText
                style={{
                  color: INK_MUTED,
                  fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                }}
              >
                VAT incl.
              </AppText>
              <AppText
                style={{
                  color: INK,
                  fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatAmount(draft.vatCents)}
              </AppText>
            </View>
            <View className="-mx-1 flex-row items-center justify-between px-1 py-0.5">
              <AppText
                style={{
                  color: INK_MUTED,
                  fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                }}
              >
                Service fee
              </AppText>
              <AppText
                style={{
                  color: INK,
                  fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatAmount(draft.serviceFeeCents)}
              </AppText>
            </View>
          </>
        ) : !useFeeRows ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit tax"
              onPress={onTotalsPress}
              className="-mx-1 flex-row items-center justify-between rounded-md px-1 py-1 active:bg-black/[0.05]"
            >
              <AppText
                style={{
                  color: INK_MUTED,
                  fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                }}
              >
                VAT incl.
              </AppText>
              <AppText
                style={{
                  color: INK,
                  fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatAmount(draft.vatCents)}
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit service fee"
              onPress={onTotalsPress}
              className="-mx-1 flex-row items-center justify-between rounded-md px-1 py-0.5 active:bg-black/[0.05]"
            >
              <AppText
                style={{
                  color: INK_MUTED,
                  fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                }}
              >
                Service fee
              </AppText>
              <AppText
                style={{
                  color: INK,
                  fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatAmount(draft.serviceFeeCents)}
              </AppText>
            </Pressable>
          </>
        ) : null}

        <View className="mt-2 flex-row items-center justify-between border-t border-stone-900/15 pt-2">
          <AppText
            className="font-bold"
            style={{ color: INK, fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY }}
          >
            TOTAL
          </AppText>
          <AppText
            className="font-bold"
            style={{
              color: INK,
              fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatAmount(total)}
          </AppText>
        </View>

        <AppText
          className="mt-4 text-center text-[10px] tracking-[0.25em]"
          style={{
            color: INK_MUTED,
            fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
          }}
        >
          {draft.billId}
        </AppText>

        <FauxBarcode foregroundColor={INK} seed={draft.billId} />

        {readOnly ? null : (
          <AppText
            className="mt-2 text-center text-[9px] leading-4"
            style={{
              color: INK_MUTED,
              fontFamily: RECEIPT_MONOSPACE_FONT_FAMILY,
            }}
          >
            ─── SAMPLE · totals follow your edits ───
          </AppText>
        )}
      </View>

      <View
        style={[
          thermalZigzagStyles.anchor,
          { bottom: -RECEIPT_ZIGZAG_DEPTH + 0.5 },
        ]}
        pointerEvents="none"
      >
        <ReceiptZigzagRow teethCount={teethCount} color={PAPER} />
      </View>
    </View>
  );
};
