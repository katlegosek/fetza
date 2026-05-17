import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import {
  type LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { useThemeColors } from "@/hooks";
import { formatZAR } from "@/lib/helper";
import {
  type SettlementMap,
  isMemberSettled,
} from "@/lib/member-settlement-storage";

// ——— Design tokens (warm dining table scene) ———
const C = {
  white: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  borderSoft: "#E5E7EB",
  tableBorder: "#E9D8B6",
  tableFillSolid: "#FFF6E6",
  chairFill: "#F1E6D8",
  chairBorder: "#E2D2C1",
  success: "#16A34A",
  successBg: "#EAF7F1",
  successBorder: "#CFEFDD",
  orbitDot: "rgba(180, 150, 110, 0.35)",
  tableShadow: "#8B6F45",
  hostPurple: "#7C3AED",
} as const;

const TABLE_BROWN = "#7D5D4B";

export type SummaryMember = { id: string; name: string };

export type SummaryTableViewProps = {
  members: SummaryMember[];
  orderedMembers: SummaryMember[];
  owed: Record<string, number>;
  settlement: SettlementMap;
  grandTotalCents: number;
  lineCount: number;
  onMemberPress: (memberId: string) => void;
  onMemberLongPress?: (memberId: string) => void;
  /** Bill breakdown / details */
  onTablePress: () => void;
  /** e.g. switch to list or people drawer */
  onMorePress?: () => void;
};

type TableMetrics = {
  tw: number;
  th: number;
  br: number;
  stageW: number;
  stageH: number;
  shiftX: number;
};

const CHAIR_TOP = { w: 46, h: 14 } as const;
const CHAIR_SIDE = { w: 16, h: 48 } as const;
const CHAIR_GAP = 5;

const AVATAR_PALETTE = [
  "#0EA5E9",
  "#22C55E",
  "#F59E0B",
  "#6366F1",
  "#F97316",
  "#14B8A6",
] as const;

const MAX_VISIBLE = 8;
const ORBIT_DOTS = 160;
const ORBIT_DASH_CYCLE = 0.014;
const ORBIT_DASH_ON = 0.38;

function isYouMember(m: SummaryMember): boolean {
  return m.id === "m-you" || m.name.trim().toLowerCase() === "you";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function avatarColor(m: SummaryMember, members: SummaryMember[]): string {
  if (isYouMember(m)) return C.hostPurple;
  const idx = Math.max(
    0,
    members.findIndex((x) => x.id === m.id),
  );
  return AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
}

/** Polar angle in degrees (0° = right, −90° = top), matching standard ellipse math. */
function participantAnglesDeg(count: number): number[] {
  switch (count) {
    case 2:
      return [-90, 90];
    case 4:
      return [-90, 0, 90, 180];
    case 6:
      return [-90, -45, 45, 90, 135, -135];
    case 8:
      return [-90, -45, 0, 45, 90, 135, 180, -135];
    default:
      return [-90];
  }
}

function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}

function pointOnEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  deg: number,
): { x: number; y: number } {
  const r = degToRad(deg);
  return { x: cx + rx * Math.cos(r), y: cy + ry * Math.sin(r) };
}

function chairCountForPeople(n: number): 2 | 4 | 6 | 8 {
  if (n <= 2) return 2;
  if (n <= 4) return 4;
  if (n <= 6) return 6;
  return 8;
}

type ChairSpec = {
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

function layoutChairsClean(
  tableLeft: number,
  tableTop: number,
  tableW: number,
  tableH: number,
  pattern: 2 | 4 | 6 | 8,
): ChairSpec[] {
  const midX = tableLeft + tableW / 2;
  const out: ChairSpec[] = [];
  const pushTop = () =>
    out.push({
      key: "c-t",
      left: midX - CHAIR_TOP.w / 2,
      top: tableTop - CHAIR_GAP - CHAIR_TOP.h,
      width: CHAIR_TOP.w,
      height: CHAIR_TOP.h,
    });
  const pushBottom = () =>
    out.push({
      key: "c-b",
      left: midX - CHAIR_TOP.w / 2,
      top: tableTop + tableH + CHAIR_GAP,
      width: CHAIR_TOP.w,
      height: CHAIR_TOP.h,
    });
  const pushLeft = (key: string, yFrac: number) => {
    const cy = tableTop + yFrac * tableH;
    out.push({
      key,
      left: tableLeft - CHAIR_GAP - CHAIR_SIDE.w,
      top: cy - CHAIR_SIDE.h / 2,
      width: CHAIR_SIDE.w,
      height: CHAIR_SIDE.h,
    });
  };
  const pushRight = (key: string, yFrac: number) => {
    const cy = tableTop + yFrac * tableH;
    out.push({
      key,
      left: tableLeft + tableW + CHAIR_GAP,
      top: cy - CHAIR_SIDE.h / 2,
      width: CHAIR_SIDE.w,
      height: CHAIR_SIDE.h,
    });
  };

  switch (pattern) {
    case 2:
      pushTop();
      pushBottom();
      break;
    case 4:
      pushTop();
      pushRight("c-r", 0.5);
      pushBottom();
      pushLeft("c-l", 0.5);
      break;
    case 6:
      pushTop();
      pushRight("c-r1", 1 / 3);
      pushRight("c-r2", 2 / 3);
      pushBottom();
      pushLeft("c-l2", 2 / 3);
      pushLeft("c-l1", 1 / 3);
      break;
    case 8:
      pushTop();
      pushRight("c-r1", 0.25);
      pushRight("c-r2", 0.5);
      pushRight("c-r3", 0.75);
      pushBottom();
      pushLeft("c-l3", 0.75);
      pushLeft("c-l2", 0.5);
      pushLeft("c-l1", 0.25);
      break;
    default:
      break;
  }
  return out;
}

// ——— Reusable UI ———

export function Chair({ spec }: { spec: ChairSpec }) {
  const r = Math.min(spec.width, spec.height) / 2;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.chairShell,
        {
          left: spec.left,
          top: spec.top,
          width: spec.width,
          height: spec.height,
          borderRadius: r,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.chairSheen,
          {
            borderTopLeftRadius: r,
            borderTopRightRadius: r,
            borderBottomLeftRadius: spec.height > spec.width ? r : 4,
            borderBottomRightRadius: spec.height > spec.width ? r : 4,
          },
        ]}
      />
    </View>
  );
}

export function AmountPill({
  amountCents,
  settled,
}: {
  amountCents: number;
  settled: boolean;
}) {
  return (
    <View
      style={[
        styles.amountPill,
        settled ? styles.amountPillPaid : styles.amountPillUnpaid,
      ]}
    >
      <Text
        style={[
          styles.amountText,
          settled ? styles.amountTextPaid : styles.amountTextUnpaid,
        ]}
      >
        {formatZAR(amountCents)}
      </Text>
      {settled ? (
        <Ionicons name="checkmark-circle" size={15} color={C.success} />
      ) : null}
    </View>
  );
}

export function ParticipantChip({
  member,
  members,
  host,
}: {
  member: SummaryMember;
  members: SummaryMember[];
  host: boolean;
}) {
  const bg = avatarColor(member, members);
  return (
    <View style={styles.chip}>
      <View style={[styles.avatar, { backgroundColor: bg }]}>
        <Text style={styles.avatarText}>{initials(member.name)}</Text>
      </View>
      <Text style={styles.chipName} numberOfLines={1}>
        {member.name}
      </Text>
      {host ? (
        <Ionicons
          accessibilityLabel="Host"
          name="person"
          size={14}
          color={C.hostPurple}
        />
      ) : null}
    </View>
  );
}

export function DiningTable({
  tableLeft,
  tableTop,
  tw,
  th,
  br,
  grandTotalCents,
  lineCount,
  onPress,
}: {
  tableLeft: number;
  tableTop: number;
  tw: number;
  th: number;
  br: number;
  grandTotalCents: number;
  lineCount: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityHint="Bill total and item count"
      accessibilityLabel={`Bill total ${formatZAR(grandTotalCents)}, ${lineCount} items`}
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      style={[
        styles.tablePressable,
        {
          left: tableLeft,
          top: tableTop,
          width: tw,
          height: th,
          borderRadius: br,
        },
      ]}
    >
      <View style={[styles.tableGradient, { borderRadius: br }]} />
      <View style={styles.tableInner}>
        <View style={styles.bookmarkCircle}>
          <Ionicons name="bookmark-outline" size={16} color={TABLE_BROWN} />
        </View>
        <Text style={styles.tableLabelSmall}>Bill total</Text>
        <Text style={styles.tableAmount}>{formatZAR(grandTotalCents)}</Text>
        <Text style={styles.tableMeta}>
          {lineCount} {lineCount === 1 ? "item" : "items"}
        </Text>
        <View style={styles.tableCta}>
          <Text style={styles.tableCtaText}>Tap for details</Text>
        </View>
      </View>
    </Pressable>
  );
}

function OrbitDotEllipse({
  cx,
  cy,
  rx,
  ry,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}) {
  const dots: ReactElement[] = [];
  for (let i = 0; i < ORBIT_DOTS; i++) {
    const t = i / ORBIT_DOTS;
    const phase = (t / ORBIT_DASH_CYCLE) % 1;
    if (phase > ORBIT_DASH_ON) continue;
    const deg = -90 + t * 360;
    const p = pointOnEllipse(cx, cy, rx, ry, deg);
    dots.push(
      <View
        key={`o-${t.toFixed(4)}`}
        pointerEvents="none"
        style={[styles.orbitDot, { left: p.x - 1.25, top: p.y - 1.25 }]}
      />,
    );
  }
  return <>{dots}</>;
}

function ParticipantAnchor({
  cx,
  cy,
  rx,
  ry,
  deg,
  member,
  members,
  owedCents,
  settled,
  onPress,
  onLongPress,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  deg: number;
  member: SummaryMember;
  members: SummaryMember[];
  owedCents: number;
  settled: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const p = pointOnEllipse(cx, cy, rx, ry, deg);
  const [chipW, setChipW] = useState(0);
  const host = isYouMember(member);
  const half = chipW > 0 ? chipW / 2 : 72;
  const namePillCenterOffset = 18;

  const onChipLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - chipW) > 0.5) setChipW(w);
  };

  return (
    <View
      style={[
        styles.participantRoot,
        {
          left: p.x - half,
          top: p.y - namePillCenterOffset,
        },
      ]}
    >
      <Pressable
        accessibilityHint="Tap for share. Long press to mark paid or unpaid."
        accessibilityLabel={`${member.name}, ${formatZAR(owedCents)}${settled ? ", paid" : ""}`}
        accessibilityRole="button"
        delayLongPress={400}
        hitSlop={6}
        onLongPress={onLongPress}
        onPress={onPress}
        style={styles.participantCol}
      >
        <View onLayout={onChipLayout}>
          <ParticipantChip host={host} member={member} members={members} />
        </View>
        <AmountPill amountCents={owedCents} settled={settled} />
      </Pressable>
    </View>
  );
}

function useTableMetrics(windowW: number): TableMetrics {
  return useMemo(() => {
    const stageW = Math.min(windowW - 24, 402);
    const stageH = Math.min(520, Math.max(440, Math.round(windowW * 1.05)));
    const scale = Math.min(1, (windowW - 32) / 360);
    const tw = Math.round(Math.min(150, Math.max(135, 142 * scale)));
    const th = Math.round(Math.min(260, Math.max(230, 248 * scale)));
    const br = Math.min(40, tw / 2);
    return {
      tw,
      th,
      br,
      stageW,
      stageH,
      shiftX: -6,
    };
  }, [windowW]);
}

export function SummaryTableView({
  members,
  orderedMembers,
  owed,
  settlement,
  grandTotalCents,
  lineCount,
  onMemberPress,
  onMemberLongPress,
  onTablePress,
  onMorePress,
}: SummaryTableViewProps) {
  const { background: pageBg } = useThemeColors();
  const { width: windowW } = useWindowDimensions();
  const { tw, th, br, stageW, stageH, shiftX } = useTableMetrics(windowW);

  const total = orderedMembers.length;
  const visible = orderedMembers.slice(0, MAX_VISIBLE);
  const overflow = Math.max(0, total - MAX_VISIBLE);
  const nVis = visible.length;
  const seatRing = chairCountForPeople(Math.max(nVis, 1));

  const centerX = stageW / 2 + shiftX;
  const centerY = stageH / 2;
  const tableLeft = centerX - tw / 2;
  const tableTop = centerY - th / 2;

  const chairs = layoutChairsClean(tableLeft, tableTop, tw, th, seatRing);

  const baseAngles = participantAnglesDeg(seatRing);
  const angles = baseAngles.slice(0, Math.max(1, nVis));
  const orbitRx = tw / 2 + 86;
  const orbitRy = th / 2 + 78;

  return (
    <View style={[styles.sceneWrap, { backgroundColor: pageBg }]}>
      <View style={[styles.stage, { width: stageW, height: stageH }]}>
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.orbitLayer]}
        >
          <OrbitDotEllipse
            cx={centerX}
            cy={centerY}
            rx={orbitRx}
            ry={orbitRy}
          />
        </View>

        {chairs.map((c) => (
          <Chair key={c.key} spec={c} />
        ))}

        <DiningTable
          br={br}
          grandTotalCents={grandTotalCents}
          lineCount={lineCount}
          tableLeft={tableLeft}
          tableTop={tableTop}
          th={th}
          tw={tw}
          onPress={onTablePress}
        />

        {visible.map((m, i) => {
          const a = angles[i] ?? -90;
          return (
            <ParticipantAnchor
              key={m.id}
              cx={centerX}
              cy={centerY}
              deg={a}
              member={m}
              members={members}
              owedCents={owed[m.id] ?? 0}
              rx={orbitRx}
              ry={orbitRy}
              settled={isMemberSettled(settlement, m.id)}
              onLongPress={
                onMemberLongPress ? () => onMemberLongPress(m.id) : undefined
              }
              onPress={() => onMemberPress(m.id)}
            />
          );
        })}

        <View
          pointerEvents="box-none"
          style={[
            styles.moreRow,
            { top: tableTop + th + 14, width: stageW, left: 0 },
          ]}
        >
          <MoreChip onMorePress={onMorePress} overflow={overflow} />
        </View>
      </View>
    </View>
  );
}

function MoreChip({
  overflow,
  onMorePress,
}: {
  overflow: number;
  onMorePress?: () => void;
}) {
  if (!onMorePress || overflow <= 0) return null;
  return (
    <Pressable
      accessibilityLabel={`${overflow} more people`}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onMorePress}
      style={styles.moreChip}
    >
      <Text style={styles.moreChipText}>+{overflow} more</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sceneWrap: {
    marginTop: 16,
    width: "100%",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 8,
    paddingBottom: 28,
  },
  stage: {
    position: "relative",
    overflow: "visible",
  },
  orbitLayer: {
    zIndex: 0,
  },
  orbitDot: {
    position: "absolute",
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: C.orbitDot,
  },
  chairShell: {
    position: "absolute",
    zIndex: 2,
    backgroundColor: C.chairFill,
    borderWidth: 1,
    borderColor: C.chairBorder,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  chairSheen: {
    position: "absolute",
    left: 2,
    right: 2,
    top: 2,
    height: "38%",
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  tablePressable: {
    position: "absolute",
    zIndex: 3,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: C.tableBorder,
    ...Platform.select({
      ios: {
        shadowColor: C.tableShadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  tableGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.tableFillSolid,
  },
  tableInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bookmarkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(233, 216, 182, 0.35)",
    marginBottom: 6,
  },
  tableLabelSmall: {
    fontSize: 11,
    fontWeight: "600",
    color: TABLE_BROWN,
    marginBottom: 4,
  },
  tableAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: C.text,
    fontVariant: ["tabular-nums"],
  },
  tableMeta: {
    marginTop: 4,
    fontSize: 11,
    color: C.muted,
  },
  tableCta: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.borderSoft,
  },
  tableCtaText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.text,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.borderSoft,
    gap: 8,
    maxWidth: 220,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.white,
  },
  chipName: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    maxWidth: 120,
  },
  amountPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "center",
    zIndex: 2,
  },
  amountPillUnpaid: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.borderSoft,
  },
  amountPillPaid: {
    backgroundColor: C.successBg,
    borderWidth: 1,
    borderColor: C.successBorder,
  },
  amountText: {
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  amountTextUnpaid: {
    color: C.text,
  },
  amountTextPaid: {
    color: C.success,
  },
  participantRoot: {
    position: "absolute",
    zIndex: 4,
  },
  participantCol: {
    alignItems: "center",
  },
  moreRow: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 5,
  },
  moreChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.borderSoft,
  },
  moreChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },
});

export const CircularSummaryTable = SummaryTableView;
export type CircularSummaryTableProps = SummaryTableViewProps;
