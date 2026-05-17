import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppText,
  Button,
  type Person,
  RECEIPT_ZIGZAG_DEPTH,
  ScreenContainer,
  ScreenHeader,
  TableScene,
  ThermalReceipt,
} from "@/components";
import { useThemeColors } from "@/hooks";
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
  saveMemberSettlement,
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

/** Breathing room below the receipt strip (modal is vertically centered). */
const SUMMARY_RECEIPT_MODAL_VERTICAL_MARGIN = 40;
/** Matches `paddingTop` + `paddingBottom` on the modal content container (8 + 8). */
const SUMMARY_RECEIPT_MODAL_INNER_PAD_Y = 16;
/** Nudges the slip below true vertical center (readability / thumb zone). */
const SUMMARY_RECEIPT_MODAL_SHIFT_DOWN = 72;

function SummaryReceiptModal({
  draft,
  onClose,
  visible,
}: {
  draft: DraftBill;
  onClose: () => void;
  visible: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const receiptWidth = Math.min(352, width - 48);
  const maxBodyHeight = Math.max(
    0,
    height -
      insets.top -
      insets.bottom -
      SUMMARY_RECEIPT_MODAL_INNER_PAD_Y -
      SUMMARY_RECEIPT_MODAL_VERTICAL_MARGIN,
  );

  const backdropOp = useSharedValue(visible ? 1 : 0);
  const scale = useSharedValue(visible ? 1 : 0.9);
  const translateY = useSharedValue(visible ? 0 : 28);

  useEffect(() => {
    if (visible) {
      backdropOp.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 16, stiffness: 260 });
      translateY.value = withSpring(0, { damping: 16, stiffness: 260 });
    } else {
      backdropOp.value = withTiming(0, { duration: 180 });
      scale.value = withTiming(0.9, { duration: 180 });
      translateY.value = withTiming(32, { duration: 180 });
    }
  }, [backdropOp, scale, translateY, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOp.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: backdropOp.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const noop = useMemo(
    () => ({
      add: () => {},
      line: (_id: string) => {},
      merchant: () => {},
      totals: () => {},
    }),
    [],
  );

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        className="flex-1 justify-center px-3"
        style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
      >
        <Animated.View
          className="absolute inset-0 bg-black/50"
          style={backdropStyle}
        >
          <Pressable
            accessibilityLabel="Dismiss receipt"
            accessibilityRole="button"
            className="flex-1"
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          className="max-w-full self-center"
          pointerEvents="box-none"
          style={[cardStyle, { marginTop: SUMMARY_RECEIPT_MODAL_SHIFT_DOWN }]}
        >
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingTop: RECEIPT_ZIGZAG_DEPTH + 8,
              paddingBottom: RECEIPT_ZIGZAG_DEPTH + 16,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: maxBodyHeight }}
          >
            <ThermalReceipt
              draft={draft}
              readOnly
              width={receiptWidth}
              onAddLine={noop.add}
              onLinePress={noop.line}
              onMerchantPress={noop.merchant}
              onTotalsPress={noop.totals}
            />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const SEAT_RING_COLORS = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-orange-500",
] as const;

const AVATAR_HEX = [
  "#0EA5E9",
  "#22C55E",
  "#F59E0B",
  "#6366F1",
  "#F97316",
  "#14B8A6",
] as const;

function asSingleParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function isYouMember(m: SummaryMember): boolean {
  return m.id === "m-you" || m.name.trim().toLowerCase() === "you";
}

function memberAvatarColorHex(
  m: SummaryMember,
  members: SummaryMember[],
): string {
  if (isYouMember(m)) return "#7C3AED";
  const idx = Math.max(
    0,
    members.findIndex((x) => x.id === m.id),
  );
  return AVATAR_HEX[idx % AVATAR_HEX.length];
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
      label: "Share",
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
  onMemberLongPress?: (memberId: string) => void;
  settlement: SettlementMap;
  onListPress: () => void;
  onOpenReceipt: () => void;
};

function SummaryBillTotalCard({
  grandTotalCents,
  lineCount,
  chevronColor,
  className,
  onOpenReceipt,
}: {
  grandTotalCents: number;
  lineCount: number;
  chevronColor: string;
  className?: string;
  onOpenReceipt: () => void;
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
      onPress={onOpenReceipt}
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
  onMemberLongPress,
  onListPress,
  onOpenReceipt,
  settlement,
}: TableSceneProps) {
  const ordered = useMemo(() => {
    return [...members].sort((a, b) => {
      const aY = isYouMember(a);
      const bY = isYouMember(b);
      if (aY && !bY) return -1;
      if (!aY && bY) return 1;
      return 0;
    });
  }, [members]);

  const people: Person[] = useMemo(
    () =>
      ordered.map((m) => ({
        id: m.id,
        name: m.name,
        initials: initials(m.name),
        amount: formatZAR(owed[m.id] ?? 0),
        color: memberAvatarColorHex(m, members),
        isHost: isYouMember(m),
        isPaid: isMemberSettled(settlement, m.id),
      })),
    [ordered, members, owed, settlement],
  );

  return (
    <View className="w-full overflow-visible rounded-3xl bg-stone-50 dark:bg-neutral-950/50">
      <TableScene
        itemCount={lineCount}
        key={ordered.map((m) => m.id).join(",")}
        maxVisibleParticipants={4}
        people={people}
        sceneBackgroundColor="transparent"
        showParticipantOverflow={false}
        style={{ marginTop: 0, borderRadius: 0 }}
        total={formatZAR(grandTotalCents)}
        onLongPressPerson={
          onMemberLongPress
            ? (p) => {
                onMemberLongPress(p.id);
              }
            : undefined
        }
        onPressMorePeople={onListPress}
        onPressPerson={(p) => {
          onMemberPress(p.id);
        }}
        onPressTable={onOpenReceipt}
      />
    </View>
  );
}

export default function BillSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ data?: string | string[] }>();
  const [viewMode, setViewMode] = useState<SummaryViewMode>("table");
  const [billReceiptOpen, setBillReceiptOpen] = useState(false);
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

  const toggleMemberPaid = useCallback(
    async (memberId: string) => {
      if (!settlementBillId || !memberId) return;
      const was = isMemberSettled(settlementByMember, memberId);
      if (was) {
        setSettlementByMember((p) => ({
          ...p,
          [memberId]: { settled: false, paidAtIso: null },
        }));
        await saveMemberSettlement(settlementBillId, memberId, false, null);
        return;
      }
      const d = new Date();
      const iso = d.toISOString();
      setSettlementByMember((p) => ({
        ...p,
        [memberId]: { settled: true, paidAtIso: iso },
      }));
      await saveMemberSettlement(settlementBillId, memberId, true, iso);
    },
    [settlementBillId, settlementByMember],
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
      Alert.alert("Share", "Add people to this bill first.");
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

  const openBillReceipt = useCallback(() => setBillReceiptOpen(true), []);
  const closeBillReceipt = useCallback(() => setBillReceiptOpen(false), []);

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
            flexGrow: 1,
            paddingBottom: insets.bottom + SUMMARY_SCROLL_PAD_BOTTOM_NAV,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityHint="Bill totals and tip"
            accessibilityRole="button"
            className="flex-row items-stretch overflow-hidden rounded-2xl border border-stone-200/40 bg-white shadow-md shadow-stone-900/8 active:bg-stone-50 dark:border-neutral-800/50 dark:bg-neutral-900 dark:shadow-none dark:active:bg-neutral-800/50"
            onPress={() => {}}
          >
            <View className="min-w-0 flex-1 flex-row items-center gap-3 py-4 pl-4 pr-2">
              <View className="size-10 shrink-0 items-center justify-center rounded-full bg-[#B8E8D0] dark:bg-emerald-800/55">
                <Ionicons name="bookmark-outline" size={20} color="#ffffff" />
              </View>
              <View className="min-w-0 flex-1">
                <AppText className="text-[12px] font-medium text-muted">
                  Outstanding
                </AppText>
                <AppText className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
                  {formatZAR(outstandingCents)}
                </AppText>
                <AppText className="mt-0.5 text-[12px] leading-snug text-muted">
                  {unpaidCount} unpaid
                </AppText>
              </View>
            </View>

            <View className="w-px self-stretch bg-stone-200/70 dark:bg-neutral-600/50" />

            <View className="min-w-0 flex-1 flex-row items-center gap-2 py-4 pl-3 pr-3">
              <View className="relative size-10 shrink-0 items-center justify-center rounded-full bg-[#FFD4A8] dark:bg-orange-900/45">
                <View className="absolute" style={{ left: 9, top: 11 }}>
                  <Ionicons name="heart" size={12} color="#ffffff" />
                </View>
                <View className="absolute" style={{ left: 15, top: 9 }}>
                  <Ionicons name="heart" size={12} color="#ffffff" />
                </View>
              </View>
              <View className="min-w-0 flex-1">
                <AppText className="text-[12px] font-medium text-muted">
                  Tip
                </AppText>
                <AppText className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
                  {formatZAR(tipCents)}
                </AppText>
                <AppText
                  className="mt-0.5 text-[12px] leading-snug text-muted"
                  numberOfLines={2}
                >
                  {tipPercentLabel}
                </AppText>
              </View>
              <View className="shrink-0 justify-center pl-0.5">
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.muted}
                />
              </View>
            </View>
          </Pressable>

          {viewMode === "table" ? (
            <View className="mt-4 min-h-0 w-full flex-1 justify-center overflow-visible">
              <SummaryTableScene
                grandTotalCents={grandTotalCents}
                lineCount={draft.lines.length}
                members={members}
                onListPress={() => setViewMode("list")}
                owed={owed}
                settlement={settlementByMember}
                onMemberLongPress={toggleMemberPaid}
                onMemberPress={openMemberShare}
                onOpenReceipt={openBillReceipt}
              />
            </View>
          ) : (
            <>
              <SummaryBillTotalCard
                chevronColor={colors.foreground}
                className="mt-4"
                grandTotalCents={grandTotalCents}
                lineCount={draft.lines.length}
                onOpenReceipt={openBillReceipt}
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
                        accessibilityHint="Tap for share. Long press to mark paid or unpaid."
                        accessibilityLabel={`${m.name}, ${lineCountForMember} items, ${formatZAR(owed[m.id] ?? 0)}`}
                        accessibilityRole="button"
                        className="active:bg-stone-50 dark:active:bg-neutral-800/50"
                        delayLongPress={400}
                        onLongPress={() => void toggleMemberPaid(m.id)}
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

        <SummaryReceiptModal
          draft={draft}
          visible={billReceiptOpen}
          onClose={closeBillReceipt}
        />
      </View>
    </ScreenContainer>
  );
}
