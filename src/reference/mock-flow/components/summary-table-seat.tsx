import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

/** Chair tile in summary table scene space (absolute coordinates). */
export type SummaryTableChairRect = {
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SummaryTableSeatEdge = "top" | "bottom" | "left" | "right";

export function summaryTableSeatEdge(
  chair: SummaryTableChairRect,
  tableLeft: number,
  tableTop: number,
  tableW: number,
  tableH: number,
): SummaryTableSeatEdge {
  const cy = chair.top + chair.height / 2;
  const cx = chair.left + chair.width / 2;
  const tableBottom = tableTop + tableH;
  if (cy < tableTop) return "top";
  if (cy > tableBottom) return "bottom";
  if (cx < tableLeft + tableW / 2) return "left";
  return "right";
}

/** Track width for top/bottom stacks (chip + amount), centered on the chair. */
const CHIP_TRACK_W = 112;
const CHIP_TRACK_HALF = CHIP_TRACK_W / 2;

/** Space between end-seat chip column and chair (top: above chair, bottom: below chair). */
const GAP_TOP_BOTTOM = 1;
const GAP_SIDE = 8;

export type SummaryTableSeatProps = {
  chair: SummaryTableChairRect;
  edge: SummaryTableSeatEdge;
  canvasW: number;
  /** Residual offset (+dx → right, +dy → down), e.g. You/James fine-tune. */
  tune: { dx: number; dy: number };
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: () => void;
  /** Toggle paid / unpaid (summary table). */
  onLongPress?: () => void;
  /** Amount row + chip, in display order for this seat (same as previous table scene). */
  children: ReactNode;
};

function ChairTile({ chair }: { chair: SummaryTableChairRect }) {
  return (
    <View
      className="rounded-lg border border-[#E8E0D6] bg-[#FDFBF7] shadow-sm shadow-stone-900/10 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-none"
      style={{ width: chair.width, height: chair.height }}
    />
  );
}

export function SummaryTableSeat({
  chair,
  edge,
  canvasW,
  tune,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  onLongPress,
  children,
}: SummaryTableSeatProps) {
  switch (edge) {
    case "top":
      return (
        <Pressable
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          className="absolute active:opacity-90"
          delayLongPress={400}
          hitSlop={4}
          onLongPress={onLongPress}
          onPress={onPress}
          style={{
            left: chair.left + chair.width / 2 - CHIP_TRACK_HALF,
            top: chair.top,
            width: CHIP_TRACK_W,
            alignItems: "center",
          }}
        >
          {/*
            Chair first so `chair.top` matches layout — chip is absolutely placed above it.
            (Column order chip→chair was pushing the chair down into the table.)
          */}
          <ChairTile chair={chair} />
          <View
            className="items-center"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: chair.height + GAP_TOP_BOTTOM,
              alignItems: "center",
              overflow: "visible",
              transform: [{ translateX: tune.dx }, { translateY: tune.dy }],
            }}
          >
            {children}
          </View>
        </Pressable>
      );
    case "bottom":
      return (
        <Pressable
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          className="absolute active:opacity-90"
          delayLongPress={400}
          hitSlop={4}
          onLongPress={onLongPress}
          onPress={onPress}
          style={{
            left: chair.left + chair.width / 2 - CHIP_TRACK_HALF,
            top: chair.top,
            width: CHIP_TRACK_W,
            alignItems: "center",
          }}
        >
          <ChairTile chair={chair} />
          {/* `tune` applies only here — chair position stays fixed to `chair.top`. */}
          <View
            className="items-center"
            style={{
              marginTop: GAP_TOP_BOTTOM,
              overflow: "visible",
              transform: [{ translateX: tune.dx }, { translateY: tune.dy }],
            }}
          >
            {children}
          </View>
        </Pressable>
      );
    case "left":
      return (
        <Pressable
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          className="absolute flex-row-reverse items-center active:opacity-90"
          delayLongPress={400}
          hitSlop={4}
          onLongPress={onLongPress}
          onPress={onPress}
          style={{
            right: canvasW - chair.left - chair.width,
            top: chair.top,
            gap: GAP_SIDE,
            height: chair.height,
          }}
        >
          <ChairTile chair={chair} />
          {/* Like top/bottom: `tune` only on the chip — chair stays on `chair.top`. */}
          <View
            className="max-w-[150px] items-center"
            style={{
              overflow: "visible",
              transform: [{ translateX: tune.dx }, { translateY: tune.dy }],
            }}
          >
            {children}
          </View>
        </Pressable>
      );
    case "right":
      return (
        <Pressable
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          className="absolute flex-row items-center active:opacity-90"
          delayLongPress={400}
          hitSlop={4}
          onLongPress={onLongPress}
          onPress={onPress}
          style={{
            left: chair.left,
            top: chair.top,
            gap: GAP_SIDE,
            height: chair.height,
          }}
        >
          <ChairTile chair={chair} />
          {/* `tune` only on chip — chair fixed (same as left / top / bottom). */}
          <View
            className="max-w-[150px] items-center"
            style={{
              overflow: "visible",
              transform: [{ translateX: tune.dx }, { translateY: tune.dy }],
            }}
          >
            {children}
          </View>
        </Pressable>
      );
    default: {
      const _exhaustive: never = edge;
      return _exhaustive;
    }
  }
}
