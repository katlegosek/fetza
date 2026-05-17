import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Fragment, useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppText,
  AssignMemberChipFace,
  Button,
  ScreenContainer,
  ScreenHeader,
} from "@/components";
import { useThemeColors } from "@/hooks";
import { assignMemberChipInactiveShellClassName } from "@/lib/assign-member-chip";
import { appendSummarySnapshot } from "@/lib/bill-summary-snapshot-storage";
import { cn } from "@/lib/cn";
import {
  type AssignmentMap,
  assignedLineCountForMember,
  cloneBillDraft,
  formatZAR,
  owedCentsByMember,
  sumLineAmountsCents,
} from "@/lib/helper";
import {
  type SettlementMap,
  isMemberSettled,
  loadSettlementMap,
} from "@/lib/member-settlement-storage";
import type { DraftBill } from "@/mocks/review-draft.mock";

type SummaryMember = { id: string; name: string };

type SummaryPayload = {
  draft: DraftBill;
  assignments: AssignmentMap;
  members: SummaryMember[];
};

type SummaryViewMode = "table" | "list";

/** Bottom padding so scroll content clears the floating single-row nav. */
const SUMMARY_SCROLL_PAD_BOTTOM_NAV = 112;

const SEAT_RING_COLORS = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-orange-500",
] as const;

/** How far bottom (James) moves down from chair anchor (+dy → down). */
const SUMMARY_TABLE_JAMES_SHIFT_DOWN = 36;

/** How far top (You) moves up from chair anchor (applied as −dy). */
const SUMMARY_TABLE_YOU_SHIFT_UP = 25;

/** Optional per-member pixel nudges after chair-center placement (+dx → right, +dy → down). */
const SUMMARY_TABLE_SEAT_NUDGE: Readonly<
  Record<string, Readonly<{ dx: number; dy: number }>>
> = {
  "m-you": { dx: 0, dy: -SUMMARY_TABLE_YOU_SHIFT_UP },
  "m-5": { dx: 0, dy: SUMMARY_TABLE_JAMES_SHIFT_DOWN },
};

/** Member ids nudged one grid column toward the table center (+dx). */
const SUMMARY_TABLE_RIGHT_GRID_NUDGE_IDS = new Set(["m-2", "m-3", "m-4"]);

const SUMMARY_TABLE_RIGHT_GRID_NAMES = new Set(
  ["alex", "sam", "joseph"].map((s) => s.toLowerCase()),
);

/** Same extra pull toward the table after one band, both sides (mirror ±). */
const SUMMARY_TABLE_SIDE_GRID_INSET_DX = 6;

/** Very slight downward nudge for left/right grid name groups (+dy → down). */
const SUMMARY_TABLE_SIDE_GRID_EXTRA_DY = 4;

/** Member ids: one band + inset toward table on the left (−dx). */
const SUMMARY_TABLE_LEFT_GRID_NUDGE_IDS = new Set(["m-6", "m-7", "m-8"]);

const SUMMARY_TABLE_LEFT_GRID_NAMES = new Set(
  ["jessie", "morgan", "taylor"].map((s) => s.toLowerCase()),
);

function tableSeatNudge(
  memberId: string,
  name: string,
  oneGridBandDx: number,
): { dx: number; dy: number } {
  const preset = SUMMARY_TABLE_SEAT_NUDGE[memberId];
  if (preset) return { ...preset };
  const key = name.trim().toLowerCase();
  if (key === "you") {
    return { dx: 0, dy: -SUMMARY_TABLE_YOU_SHIFT_UP };
  }
  if (key === "james") {
    return { dx: 0, dy: SUMMARY_TABLE_JAMES_SHIFT_DOWN };
  }
  if (
    SUMMARY_TABLE_RIGHT_GRID_NUDGE_IDS.has(memberId) ||
    SUMMARY_TABLE_RIGHT_GRID_NAMES.has(key)
  ) {
    return {
      dx: oneGridBandDx + SUMMARY_TABLE_SIDE_GRID_INSET_DX,
      dy: SUMMARY_TABLE_SIDE_GRID_EXTRA_DY,
    };
  }
  if (
    SUMMARY_TABLE_LEFT_GRID_NUDGE_IDS.has(memberId) ||
    SUMMARY_TABLE_LEFT_GRID_NAMES.has(key)
  ) {
    return {
      dx: -(oneGridBandDx + SUMMARY_TABLE_SIDE_GRID_INSET_DX),
      dy: SUMMARY_TABLE_SIDE_GRID_EXTRA_DY,
    };
  }
  return { dx: 0, dy: 0 };
}

function summaryTableIsRightGridMember(
  memberId: string,
  name: string,
): boolean {
  const key = name.trim().toLowerCase();
  return (
    SUMMARY_TABLE_RIGHT_GRID_NUDGE_IDS.has(memberId) ||
    SUMMARY_TABLE_RIGHT_GRID_NAMES.has(key)
  );
}

/** Table shape + chair pattern from party size (chairs only for now). */
type SummaryTableLayoutId = "two" | "four" | "six" | "eight";

function summaryTableLayoutFromCount(count: number): SummaryTableLayoutId {
  if (count <= 0) return "four";
  if (count <= 2) return "two";
  if (count <= 4) return "four";
  if (count <= 6) return "six";
  return "eight";
}

function summaryTableSizeForLayout(layout: SummaryTableLayoutId): {
  w: number;
  h: number;
} {
  switch (layout) {
    case "two":
      return { w: 108, h: 200 };
    case "four":
      return { w: 126, h: 236 };
    case "six":
      return { w: 132, h: 264 };
    case "eight":
      return { w: 138, h: 284 };
    default:
      return { w: 138, h: 284 };
  }
}

type ChairRect = {
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Chair tiles outside the table edge — top/bottom wide, sides tall. */
function summaryTableChairsForLayout(
  layout: SummaryTableLayoutId,
  tableLeft: number,
  tableTop: number,
  tableW: number,
  tableH: number,
): ChairRect[] {
  const HW = 40;
  const HH = 16;
  const VW = 16;
  const VH = 40;
  const topGap = 22;
  const bottomGap = 6;
  const sideOut = 20;
  const rightGap = 6;

  const midX = tableLeft + tableW / 2;
  const chairs: ChairRect[] = [];

  const pushTop = (key: string, dx = 0) => {
    chairs.push({
      key,
      left: midX - HW / 2 + dx,
      top: tableTop - topGap,
      width: HW,
      height: HH,
    });
  };
  const pushBottom = (key: string, dx = 0) => {
    chairs.push({
      key,
      left: midX - HW / 2 + dx,
      top: tableTop + tableH + bottomGap,
      width: HW,
      height: HH,
    });
  };
  const pushLeft = (key: string, yFrac: number) => {
    const cy = tableTop + yFrac * tableH;
    chairs.push({
      key,
      left: tableLeft - sideOut,
      top: cy - VH / 2,
      width: VW,
      height: VH,
    });
  };
  const pushRight = (key: string, yFrac: number) => {
    const cy = tableTop + yFrac * tableH;
    chairs.push({
      key,
      left: tableLeft + tableW + rightGap,
      top: cy - VH / 2,
      width: VW,
      height: VH,
    });
  };

  /** Clockwise from top — member index `i` maps to `chairs[i]`. */
  switch (layout) {
    case "two":
      pushTop("chair-t");
      pushBottom("chair-b");
      break;
    case "four":
      pushTop("chair-t");
      pushRight("chair-r", 0.5);
      pushBottom("chair-b");
      pushLeft("chair-l", 0.5);
      break;
    case "six":
      pushTop("chair-t");
      pushRight("chair-r1", 1 / 3);
      pushRight("chair-r2", 2 / 3);
      pushBottom("chair-b");
      pushLeft("chair-l2", 2 / 3);
      pushLeft("chair-l1", 1 / 3);
      break;
    case "eight":
      pushTop("chair-t");
      pushRight("chair-r1", 0.25);
      pushRight("chair-r2", 0.5);
      pushRight("chair-r3", 0.75);
      pushBottom("chair-b");
      pushLeft("chair-l3", 0.75);
      pushLeft("chair-l2", 0.5);
      pushLeft("chair-l1", 0.25);
      break;
    default:
      break;
  }

  return chairs;
}

/** Vertical guides: same 2 lines, just outside the chair blocks (includes table + side chairs). */
function summaryTableSceneVerticalGridXs(
  layout: SummaryTableLayoutId,
  tableLeft: number,
  tableW: number,
): [number, number] {
  const HW = 40;
  const VW = 16;
  const sideOut = 20;
  const rightGap = 6;
  const outsidePad = 6;

  const tableRight = tableLeft + tableW;
  const midX = tableLeft + tableW / 2;

  if (layout === "two") {
    const half = HW / 2;
    return [midX - half - outsidePad, midX + half + outsidePad];
  }

  const leftChairLeft = tableLeft - sideOut;
  const rightChairRight = tableRight + rightGap + VW;
  return [leftChairLeft - outsidePad, rightChairRight + outsidePad];
}

/** Chip anchor at each chair’s center; `isTopEdge` drives amount above vs below the pill. */
function summaryChairAvatarAnchor(
  c: ChairRect,
  tableTop: number,
): { x: number; y: number; isTopEdge: boolean } {
  const x = c.left + c.width / 2;
  const y = c.top + c.height / 2;
  const isTopEdge = y < tableTop;
  return { x, y, isTopEdge };
}

/** Member chips: one per chair, same index as `chairRects` (clockwise from top). */
const SUMMARY_TABLE_MEMBER_CHIPS = true;

/** Scene layout grid: 3 vertical bands (2 lines) just outside the chair blocks — middle band = table + chairs. */
const SUMMARY_TABLE_SCENE_SHOW_VERTICAL_GRID = true;

function asSingleParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function isYouMember(m: SummaryMember): boolean {
  return m.id === "m-you" || m.name.trim().toLowerCase() === "you";
}

function listMemberAvatarClass(
  m: SummaryMember,
  members: SummaryMember[],
): string {
  if (isYouMember(m)) return "bg-violet-500";
  const idx = Math.max(
    0,
    members.findIndex((x) => x.id === m.id),
  );
  return SEAT_RING_COLORS[idx % SEAT_RING_COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function SummaryBottomNav({
  insetsBottom,
  iconColor,
  onPeople,
  onShareSummary,
  onSave,
  onDone,
}: {
  insetsBottom: number;
  iconColor: string;
  onPeople: () => void;
  onShareSummary: () => void;
  onSave: () => void;
  onDone: () => void;
}) {
  const items = [
    {
      key: "people",
      label: "People",
      icon: "people-outline" as const,
      onPress: onPeople,
    },
    {
      key: "share",
      label: "Share summary",
      icon: "share-social-outline" as const,
      onPress: onShareSummary,
    },
    {
      key: "save",
      label: "Save",
      icon: "bookmark-outline" as const,
      onPress: onSave,
    },
    {
      key: "done",
      label: "Done",
      icon: "checkmark" as const,
      onPress: onDone,
    },
  ];

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 z-10 px-4 pt-0"
      style={{ paddingBottom: insetsBottom }}
    >
      <View className="rounded-[28px] border border-stone-200/90 bg-white p-3 shadow-lg shadow-black/12 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-black/35">
        <View className="flex-row items-stretch">
          {items.map((item, index) => (
            <Fragment key={item.key}>
              {index > 0 ? (
                <View className="my-3 w-px shrink-0 self-stretch bg-stone-200 dark:bg-neutral-600" />
              ) : null}
              <Pressable
                accessibilityLabel={item.label}
                accessibilityRole="button"
                className="min-w-0 flex-1 items-center justify-center gap-1 py-3.5 active:opacity-85"
                hitSlop={4}
                onPress={item.onPress}
              >
                <Ionicons name={item.icon} size={22} color={iconColor} />
                <AppText
                  className="px-0.5 text-center text-[9px] font-bold leading-tight text-foreground"
                  numberOfLines={2}
                >
                  {item.label}
                </AppText>
              </Pressable>
            </Fragment>
          ))}
        </View>
      </View>
    </View>
  );
}

function TableListToggle({
  value,
  onChange,
}: {
  value: SummaryViewMode;
  onChange: (v: SummaryViewMode) => void;
}) {
  return (
    <View className="flex-row rounded-full border border-borderSubtle bg-stone-100/90 p-0.5 dark:border-neutral-700 dark:bg-neutral-900">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === "table" }}
        className={cn(
          "rounded-full px-2.5 py-1.5 active:opacity-90",
          value === "table" && "bg-foreground",
        )}
        hitSlop={6}
        onPress={() => onChange("table")}
      >
        <AppText
          className={cn(
            "text-center text-[11px] font-bold tracking-wide",
            value === "table" ? "text-background" : "text-foreground",
          )}
        >
          Table
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === "list" }}
        className={cn(
          "rounded-full px-2.5 py-1.5 active:opacity-90",
          value === "list" && "bg-foreground",
        )}
        hitSlop={6}
        onPress={() => onChange("list")}
      >
        <AppText
          className={cn(
            "text-center text-[11px] font-bold tracking-wide",
            value === "list" ? "text-background" : "text-foreground",
          )}
        >
          List
        </AppText>
      </Pressable>
    </View>
  );
}

type TableSceneProps = {
  members: SummaryMember[];
  owed: Record<string, number>;
  grandTotalCents: number;
  lineCount: number;
  onMemberPress: (memberId: string) => void;
  settlement: SettlementMap;
};

function SummaryBillTotalCard({
  grandTotalCents,
  lineCount,
  chevronColor,
  className,
}: {
  grandTotalCents: number;
  lineCount: number;
  chevronColor: string;
  className?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`Bill total ${formatZAR(grandTotalCents)}, ${lineCount} items. Details`}
      accessibilityRole="button"
      className={cn(
        "flex-row items-center gap-3 rounded-2xl border border-violet-200/70 bg-violet-50 p-4 shadow-sm shadow-violet-950/5 active:opacity-90 dark:border-violet-900/45 dark:bg-violet-950/40 dark:shadow-none",
        className,
      )}
      hitSlop={4}
      onPress={() =>
        Alert.alert(
          "Bill details",
          `Total ${formatZAR(grandTotalCents)} across ${lineCount} items.`,
        )
      }
    >
      <View className="size-11 shrink-0 items-center justify-center rounded-full bg-violet-200/90 dark:bg-violet-500/25">
        <Ionicons name="document-text-outline" size={22} color="#7c3aed" />
      </View>
      <View className="min-w-0 flex-1">
        <AppText className="text-base font-bold text-foreground">
          Bill total
        </AppText>
        <AppText className="mt-0.5 text-sm text-muted">
          {lineCount} {lineCount === 1 ? "item" : "items"}
        </AppText>
      </View>
      <View className="shrink-0 flex-row items-center gap-0.5 pl-1">
        <AppText className="text-base font-bold tabular-nums text-foreground">
          {formatZAR(grandTotalCents)}
        </AppText>
        <Ionicons name="chevron-forward" size={18} color={chevronColor} />
      </View>
    </Pressable>
  );
}

function SummaryTableScene({
  members,
  owed,
  grandTotalCents,
  lineCount,
  onMemberPress,
  settlement,
}: TableSceneProps) {
  const { width: windowW } = useWindowDimensions();
  const ordered = useMemo(() => {
    return [...members].sort((a, b) => {
      const aY = isYouMember(a);
      const bY = isYouMember(b);
      if (aY && !bY) return -1;
      if (!aY && bY) return 1;
      return 0;
    });
  }, [members]);

  const n = ordered.length;
  /** Use device width so the seat ring can sit farther outside the table without clipping. */
  const canvasW = Math.min(402, Math.max(336, windowW - 32));
  const canvasH = 520;
  /** Table vertically centered in canvas → equal top/bottom gap to table edges; slight left nudge. */
  const TABLE_SCENE_SHIFT_X = -8;
  const centerX = canvasW / 2 + TABLE_SCENE_SHIFT_X;
  const centerY = canvasH / 2;
  const tableLayout = summaryTableLayoutFromCount(n);
  const { w: tableW, h: tableH } = summaryTableSizeForLayout(tableLayout);
  const tableLeft = centerX - tableW / 2;
  const tableTop = centerY - tableH / 2;
  const chairRects = summaryTableChairsForLayout(
    tableLayout,
    tableLeft,
    tableTop,
    tableW,
    tableH,
  );
  const [gridLineLeftX, gridLineRightX] = summaryTableSceneVerticalGridXs(
    tableLayout,
    tableLeft,
    tableW,
  );
  const tableSceneGridBandDx = (gridLineRightX - gridLineLeftX) / 3;

  return (
    <View className="mt-4 w-full items-center">
      <View
        className="relative w-full"
        style={{ height: canvasH, maxWidth: canvasW }}
      >
        {SUMMARY_TABLE_SCENE_SHOW_VERTICAL_GRID
          ? [gridLineLeftX, gridLineRightX].map((x, i) => (
              <View
                key={`summary-table-vgrid-${i === 0 ? "l" : "r"}`}
                pointerEvents="none"
                className="absolute bg-violet-600/25 dark:bg-violet-300/20"
                style={{
                  left: x,
                  top: 0,
                  width: StyleSheet.hairlineWidth,
                  height: canvasH,
                }}
              />
            ))
          : null}

        {/* Table top — portrait rectangle */}
        <View
          className="absolute overflow-hidden rounded-[32px] border-2 border-amber-800/15 bg-amber-50 shadow-md shadow-amber-900/10 dark:border-amber-700/25 dark:bg-amber-950/40 dark:shadow-none"
          style={{
            width: tableW,
            height: tableH,
            left: tableLeft,
            top: tableTop,
          }}
        >
          <View className="flex-1 items-center justify-center px-3 py-2">
            <View className="items-center gap-0.5">
              <AppText className="text-center text-[11px] font-medium leading-none text-amber-900/70 dark:text-amber-100/80">
                Bill total
              </AppText>
              <AppText className="text-center text-xl font-bold tabular-nums leading-tight text-foreground">
                {formatZAR(grandTotalCents)}
              </AppText>
              <AppText className="text-center text-[11px] leading-none text-muted">
                {lineCount} {lineCount === 1 ? "item" : "items"}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bill details"
              className="mt-1.5 rounded-full border border-amber-800/25 bg-white/90 px-3 py-1 active:opacity-85 dark:border-amber-600/40 dark:bg-neutral-900/90"
              hitSlop={6}
              onPress={() =>
                Alert.alert(
                  "Bill details",
                  `Total ${formatZAR(grandTotalCents)} across ${lineCount} items.`,
                )
              }
            >
              <AppText className="text-center text-[11px] font-semibold leading-tight text-foreground">
                Tap for details
              </AppText>
            </Pressable>
          </View>
        </View>

        {chairRects.map((c) => (
          <View
            key={c.key}
            className="absolute rounded-lg bg-amber-900/10 dark:bg-amber-100/10"
            style={{
              width: c.width,
              height: c.height,
              left: c.left,
              top: c.top,
            }}
          />
        ))}

        {SUMMARY_TABLE_MEMBER_CHIPS && n > 0
          ? ordered.map((m, i) => {
              const chair = chairRects[i];
              if (!chair) return null;
              const isYou = isYouMember(m);
              const anchor = summaryChairAvatarAnchor(chair, tableTop);
              const { dx: nudgeX, dy: nudgeY } = tableSeatNudge(
                m.id,
                m.name,
                tableSceneGridBandDx,
              );
              const seatX = anchor.x + nudgeX;
              const seatY = anchor.y + nudgeY;
              const { isTopEdge } = anchor;
              const chipLayoutHalfW = 56;
              const chipOriginY = isTopEdge ? 40 : 24;
              const isRightGridMember = summaryTableIsRightGridMember(
                m.id,
                m.name,
              );
              const colorIdx =
                Math.max(
                  0,
                  members.findIndex((x) => x.id === m.id),
                ) % SEAT_RING_COLORS.length;
              const seatBg = isYou
                ? "bg-violet-500"
                : SEAT_RING_COLORS[colorIdx];
              const settled = isMemberSettled(settlement, m.id);
              const owedCents = owed[m.id] ?? 0;
              const amountLabel = (
                <AppText
                  className={cn(
                    "text-center text-[10px] font-semibold tabular-nums leading-none",
                    settled ? "text-muted" : "text-foreground",
                  )}
                >
                  {formatZAR(owedCents)}
                </AppText>
              );
              const chip = settled ? (
                <View
                  className={cn(
                    "flex-row items-center gap-1.5 rounded-full border border-stone-200/90 bg-white py-1 pr-2.5 dark:border-neutral-700 dark:bg-neutral-900",
                    isRightGridMember ? "pl-2" : "pl-1",
                  )}
                >
                  <View
                    className={cn(
                      "size-9 shrink-0 items-center justify-center rounded-full",
                      seatBg,
                    )}
                  >
                    <AppText className="text-[11px] font-bold text-white">
                      {initials(m.name)}
                    </AppText>
                  </View>
                  <View className="max-w-[90px] min-w-0 flex-row items-center gap-1">
                    <AppText
                      className="min-w-0 shrink text-[12px] font-semibold text-foreground"
                      numberOfLines={1}
                    >
                      {m.name}
                    </AppText>
                    {isYou ? (
                      <Ionicons
                        name="ribbon-outline"
                        size={13}
                        color="#7c3aed"
                      />
                    ) : null}
                    <View className="shrink-0">
                      <Ionicons
                        accessibilityLabel="Paid"
                        name="checkmark-circle"
                        size={13}
                        color="#059669"
                      />
                    </View>
                  </View>
                </View>
              ) : (
                <View
                  className={cn(
                    assignMemberChipInactiveShellClassName(true),
                    isRightGridMember && "pl-2",
                  )}
                >
                  <AssignMemberChipFace
                    avatarBgClassName={seatBg}
                    density="compact"
                    initialsText={initials(m.name)}
                    name={m.name}
                    showYouRibbon={isYou}
                  />
                </View>
              );

              return (
                <Pressable
                  key={m.id}
                  accessibilityHint="View item breakdown"
                  accessibilityLabel={`${m.name}, ${formatZAR(owed[m.id] ?? 0)}`}
                  accessibilityRole="button"
                  className="absolute items-center active:opacity-90"
                  hitSlop={4}
                  style={{
                    left: seatX - chipLayoutHalfW,
                    top: seatY - chipOriginY,
                  }}
                  onPress={() => onMemberPress(m.id)}
                >
                  {isTopEdge ? (
                    <>
                      <View className="mb-0.5">{amountLabel}</View>
                      {chip}
                    </>
                  ) : (
                    <>
                      {chip}
                      <View className="mt-0.5">{amountLabel}</View>
                    </>
                  )}
                </Pressable>
              );
            })
          : null}
      </View>
    </View>
  );
}

export default function BillSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ data?: string | string[] }>();
  const [viewMode, setViewMode] = useState<SummaryViewMode>("table");
  const [settlementByMember, setSettlementByMember] = useState<SettlementMap>(
    {},
  );

  const payload = useMemo((): SummaryPayload | null => {
    const raw = asSingleParam(params.data);
    if (!raw || raw.length === 0) return null;
    try {
      const p = JSON.parse(raw) as SummaryPayload;
      if (
        !p?.draft?.lines ||
        p.assignments == null ||
        !Array.isArray(p.members)
      ) {
        return null;
      }
      return {
        draft: cloneBillDraft(p.draft),
        assignments: { ...p.assignments },
        members: p.members.map((m) => ({ ...m })),
      };
    } catch {
      return null;
    }
  }, [params.data]);

  const settlementBillId = payload?.draft.billId ?? "";

  useFocusEffect(
    useCallback(() => {
      if (!settlementBillId) return;
      void loadSettlementMap(settlementBillId).then(setSettlementByMember);
    }, [settlementBillId]),
  );

  const model = useMemo(() => {
    if (!payload) return null;
    const { draft, assignments, members } = payload;
    const memberIds = members.map((m) => m.id);
    const owed = owedCentsByMember(draft, assignments, memberIds);
    const linesSub = sumLineAmountsCents(draft.lines);
    const grandTotalCents = linesSub + draft.vatCents + draft.serviceFeeCents;
    const tipCents = draft.serviceFeeCents;
    const tipPercentLabel =
      linesSub > 0 && tipCents > 0
        ? `${Math.round((tipCents / linesSub) * 100)}% of bill`
        : tipCents > 0
          ? "Service charge"
          : "No tip";

    return {
      draft,
      assignments,
      members,
      owed,
      grandTotalCents,
      tipCents,
      tipPercentLabel,
    };
  }, [payload]);

  const outstandingCents = useMemo(() => {
    if (!model) return 0;
    return model.members.reduce((s, m) => {
      if (settlementByMember[m.id]?.settled) return s;
      return s + (model.owed[m.id] ?? 0);
    }, 0);
  }, [model, settlementByMember]);

  const unpaidCount = useMemo(() => {
    if (!model) return 0;
    return model.members.filter(
      (m) => (model.owed[m.id] ?? 0) > 0 && !settlementByMember[m.id]?.settled,
    ).length;
  }, [model, settlementByMember]);

  if (!model) {
    return (
      <ScreenContainer className="flex-1">
        <ScreenHeader title="Summary" onBack={() => router.back()} />
        <View className="flex-1 bg-stone-50 dark:bg-neutral-950/50">
          <View className="flex-1 items-center justify-center px-6">
            <AppText className="text-center text-base leading-6 text-muted">
              No bill data to show. Open Summary from Assign after splitting
              items.
            </AppText>
            <Button className="mt-6 w-full" onPress={() => router.back()}>
              Go back
            </Button>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  const {
    draft,
    assignments,
    members,
    owed,
    grandTotalCents,
    tipCents,
    tipPercentLabel,
  } = model;

  const listMembersOrdered = useMemo(() => {
    return [...members].sort((a, b) => {
      const aY = isYouMember(a);
      const bY = isYouMember(b);
      if (aY && !bY) return -1;
      if (!aY && bY) return 1;
      return 0;
    });
  }, [members]);

  const merchantHint =
    draft.merchant.trim().length > 0 ? draft.merchant.trim() : undefined;

  const dataParam = asSingleParam(params.data);

  const openMemberShare = useCallback(
    (memberId: string) => {
      if (!dataParam) return;
      router.push({
        pathname: "/scan/share",
        params: { data: dataParam, memberId },
      });
    },
    [router, dataParam],
  );

  const handleBottomPeople = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace({
      pathname: "/scan/assign",
      params: { draft: JSON.stringify(cloneBillDraft(draft)) },
    });
  }, [router, draft]);

  const handleBottomShareSummary = useCallback(() => {
    if (!dataParam) return;
    const you = members.find((m) => isYouMember(m));
    const memberId = you?.id ?? members[0]?.id;
    if (!memberId) {
      Alert.alert("Share summary", "Add people to this bill first.");
      return;
    }
    openMemberShare(memberId);
  }, [dataParam, members, openMemberShare]);

  const handleBottomSave = useCallback(() => {
    if (!dataParam) return;
    void appendSummarySnapshot(dataParam).then(() => {
      Alert.alert("Saved", "Summary saved on this device.");
    });
  }, [dataParam]);

  const handleBottomDone = useCallback(() => {
    router.dismissTo("/");
  }, [router]);

  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader
        rightSlot={<TableListToggle onChange={setViewMode} value={viewMode} />}
        title="Summary"
        topHint={merchantHint}
        onBack={() => router.back()}
      />

      <View className="relative flex-1 bg-stone-50 dark:bg-neutral-950/50">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pt-2"
          contentContainerStyle={{
            paddingBottom: insets.bottom + SUMMARY_SCROLL_PAD_BOTTOM_NAV,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityHint="Bill totals and tip"
            accessibilityRole="button"
            className="flex-row items-stretch overflow-hidden rounded-2xl border border-stone-200/30 bg-white px-3 py-4 shadow-sm shadow-stone-900/5 active:bg-stone-50 dark:border-neutral-800/45 dark:bg-neutral-900 dark:shadow-none dark:active:bg-neutral-800/50"
            onPress={() => {}}
          >
            <View className="min-w-0 flex-1 pr-2">
              <AppText className="text-[10px] font-bold tracking-wider text-muted">
                OUTSTANDING
              </AppText>
              <AppText className="mt-1 text-xl font-bold tabular-nums text-foreground">
                {formatZAR(outstandingCents)}
              </AppText>
              <AppText className="mt-0.5 text-xs text-muted">
                {unpaidCount} unpaid
              </AppText>
            </View>

            <View
              className="mx-1 w-px self-stretch bg-stone-200/35 dark:bg-neutral-600/40"
              style={{ minHeight: 48 }}
            />

            <View className="min-w-0 flex-1 pl-2 pr-1">
              <AppText className="text-[10px] font-bold tracking-wider text-muted">
                TIP
              </AppText>
              <AppText className="mt-1 text-xl font-bold tabular-nums text-foreground">
                {formatZAR(tipCents)}
              </AppText>
              <AppText className="mt-0.5 text-xs text-muted">
                {tipPercentLabel}
              </AppText>
            </View>

            <View className="shrink-0 justify-center pl-0.5">
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.foreground}
              />
            </View>
          </Pressable>

          {viewMode === "table" ? (
            <SummaryTableScene
              grandTotalCents={grandTotalCents}
              lineCount={draft.lines.length}
              members={members}
              owed={owed}
              settlement={settlementByMember}
              onMemberPress={openMemberShare}
            />
          ) : (
            <>
              <SummaryBillTotalCard
                chevronColor={colors.foreground}
                className="mt-4"
                grandTotalCents={grandTotalCents}
                lineCount={draft.lines.length}
              />
              <AppText className="mt-6 text-base font-semibold text-foreground">
                Who owes what
              </AppText>

              <View className="mt-3 overflow-hidden rounded-2xl border border-stone-200/30 bg-background dark:border-neutral-800/45">
                {listMembersOrdered.map((m, index) => {
                  const lineCountForMember = assignedLineCountForMember(
                    draft,
                    assignments,
                    m.id,
                  );
                  const avatarBg = listMemberAvatarClass(m, members);
                  const settled = isMemberSettled(settlementByMember, m.id);
                  return (
                    <View key={m.id}>
                      {index > 0 ? (
                        <View className="mx-4 h-px bg-stone-200/30 dark:bg-neutral-700/35" />
                      ) : null}
                      <Pressable
                        accessibilityHint="View line items and breakdown"
                        accessibilityLabel={`${m.name}, ${lineCountForMember} items, ${formatZAR(owed[m.id] ?? 0)}`}
                        accessibilityRole="button"
                        className="active:bg-stone-50 dark:active:bg-neutral-800/50"
                        onPress={() => openMemberShare(m.id)}
                      >
                        <View className="flex-row items-center gap-2 px-4 py-3">
                          <View
                            className={cn(
                              "size-10 shrink-0 items-center justify-center rounded-full",
                              avatarBg,
                            )}
                          >
                            <AppText className="text-[12px] font-bold text-white">
                              {initials(m.name)}
                            </AppText>
                          </View>
                          <View className="min-w-0 flex-1">
                            <View className="max-w-full flex-row items-center gap-1 self-start">
                              <AppText
                                className="min-w-0 shrink text-sm font-semibold text-foreground"
                                numberOfLines={1}
                              >
                                {m.name}
                              </AppText>
                              {isYouMember(m) ? (
                                <View className="shrink-0">
                                  <Ionicons
                                    accessibilityLabel="You"
                                    name="ribbon-outline"
                                    size={15}
                                    color="#7c3aed"
                                  />
                                </View>
                              ) : null}
                            </View>
                            <AppText className="mt-0.5 text-[13px] leading-snug text-muted">
                              {lineCountForMember}{" "}
                              {lineCountForMember === 1 ? "item" : "items"}
                            </AppText>
                          </View>
                          <View className="shrink-0 flex-row items-center gap-1.5">
                            {settled ? (
                              <View className="flex-row items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 dark:bg-emerald-950/80">
                                <Ionicons
                                  name="checkmark-circle"
                                  size={14}
                                  color="#059669"
                                />
                                <AppText className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                                  Paid
                                </AppText>
                              </View>
                            ) : null}
                            <AppText
                              className={cn(
                                "text-sm font-semibold tabular-nums",
                                settled ? "text-muted" : "text-foreground",
                              )}
                            >
                              {formatZAR(owed[m.id] ?? 0)}
                            </AppText>
                            <Ionicons
                              name="chevron-forward"
                              size={20}
                              color={colors.muted}
                            />
                          </View>
                        </View>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>

        <SummaryBottomNav
          iconColor={colors.foreground}
          insetsBottom={insets.bottom}
          onDone={handleBottomDone}
          onPeople={handleBottomPeople}
          onSave={handleBottomSave}
          onShareSummary={handleBottomShareSummary}
        />
      </View>
    </ScreenContainer>
  );
}
