import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isApiError } from "@/api/errors";
import {
  AnimatedZarAmount,
  AppText,
  AssignItemSheet,
  AssignLineRow,
  AssignMemberChipFace,
  AssignOverflowMenu,
  Button,
  NoticeBanner,
  ScreenContainer,
  ScreenHeader,
} from "@/components";
import {
  useAppColorScheme,
  useBill,
  useBillBulkAssignments,
  useBillParticipants,
  useBillSummary,
  useReplaceItemAssignments,
  useThemeColors,
} from "@/hooks";
import { assignMemberChipPressableClassName } from "@/lib/assign-member-chip";
import { cn } from "@/lib/cn";
import { cloneBillDraft, sumLineAmountsCents } from "@/lib/helper";
import { memberAssignHighlightFromTones } from "@/lib/member-assign-highlight";
import {
  type MemberAvatarTones,
  avatarTonesForPaletteIndex,
  memberChipBorderToneForIndex,
} from "@/lib/member-avatar-tones";
import type { DraftBill, ReceiptLine } from "@/mocks/review-draft.mock";
import { type AssignLine, billShowToAssignData } from "@/utils/bill-to-assign";
import { formatMoneyFromCents } from "@/utils/money";
import { participantInitials } from "@/utils/participant";
import { buildParticipantInput } from "@/utils/participant-input";

type Member = {
  id: string;
  name: string;
  tone: string;
  isHost?: boolean;
} & MemberAvatarTones;

const SEED_MEMBER_ROWS: { id: string; name: string }[] = [
  { id: "m-you", name: "You" },
  { id: "m-2", name: "Alex" },
  { id: "m-3", name: "Sam" },
  { id: "m-4", name: "Joseph" },
  { id: "m-5", name: "James" },
  { id: "m-6", name: "Jessie" },
  { id: "m-7", name: "Morgan" },
  { id: "m-8", name: "Taylor" },
];

const SEED_MEMBERS: Member[] = SEED_MEMBER_ROWS.map((row, i) => ({
  ...row,
  ...avatarTonesForPaletteIndex(i),
  tone: memberChipBorderToneForIndex(i),
}));

type Assignments = Record<string, string[]>;

function cloneAssignments(a: Assignments): Assignments {
  const next: Assignments = {};
  for (const k of Object.keys(a)) {
    next[k] = [...a[k]];
  }
  return next;
}

/** Every line includes exactly the current member set (full split-everything state). */
function isBillSplitEquallyAmongAll(
  lines: DraftBill["lines"],
  members: Member[],
  assignments: Assignments,
): boolean {
  if (members.length === 0 || lines.length === 0) return false;
  const expected = new Set(members.map((m) => m.id));
  for (const line of lines) {
    const got = new Set(assignments[line.id] ?? []);
    if (got.size !== expected.size) return false;
    for (const id of expected) {
      if (!got.has(id)) return false;
    }
  }
  return true;
}

function parseBillId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AssignBillScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const scheme = useAppColorScheme();
  const { billId: billIdParam, draft: draftParam } = useLocalSearchParams<{
    billId?: string | string[];
    draft?: string;
  }>();
  const billId = parseBillId(billIdParam);
  const isApiMode = billId > 0;

  const {
    data: billData,
    isLoading: billLoading,
    isError: billError,
    error: billLoadError,
    refetch: refetchBill,
  } = useBill(billId);
  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryLoadError,
    refetch: refetchSummary,
  } = useBillSummary(billId);

  const replaceItemAssignments = useReplaceItemAssignments(billId);
  const bulkAssignments = useBillBulkAssignments(billId);
  const billParticipants = useBillParticipants(billId);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  useEffect(() => {
    if (!assignmentError) {
      return;
    }

    const timeout = setTimeout(() => setAssignmentError(null), 4000);
    return () => clearTimeout(timeout);
  }, [assignmentError]);

  const apiAssignData = useMemo(
    () => (billData ? billShowToAssignData(billData) : null),
    [billData],
  );

  const [draft, setDraft] = useState<DraftBill | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [mockMembers, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [sheetLineId, setSheetLineId] = useState<string | null>(null);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const assignmentsBeforeSplitRef = useRef<Assignments | null>(null);

  useEffect(() => {
    if (!draftParam) {
      setDraft(null);
      setHydrated(true);
      return;
    }
    try {
      const parsed = JSON.parse(draftParam) as DraftBill;
      setDraft(cloneBillDraft(parsed));
      setAssignments({});
      assignmentsBeforeSplitRef.current = null;
      setMembers(SEED_MEMBERS);
      setActiveMemberId(null);
    } catch {
      setDraft(null);
    } finally {
      setHydrated(true);
    }
  }, [draftParam]);

  const mockLines = draft?.lines ?? [];
  const apiLines = apiAssignData?.lines ?? [];
  const apiMembers = apiAssignData?.members ?? [];
  const apiAssignments = apiAssignData?.assignments ?? {};

  const members = isApiMode ? apiMembers : mockMembers;
  const lines: Array<AssignLine | ReceiptLine> = isApiMode
    ? apiLines
    : mockLines;
  const displayAssignments = isApiMode ? apiAssignments : assignments;

  const memberById = useMemo(() => {
    const m = new Map<string, Member>();
    for (const x of members) {
      m.set(x.id, x);
    }
    return m;
  }, [members]);

  const linesSubtotalCents = useMemo(
    () => sumLineAmountsCents(isApiMode ? apiLines : mockLines),
    [isApiMode, apiLines, mockLines],
  );

  const billGrandTotalCents = useMemo(() => {
    if (isApiMode) {
      return summaryData?.totals.bill_total_cents ?? 0;
    }
    if (!draft) return 0;
    return linesSubtotalCents + draft.vatCents + draft.serviceFeeCents;
  }, [
    draft,
    isApiMode,
    linesSubtotalCents,
    summaryData?.totals.bill_total_cents,
  ]);

  const assignedItemsTotalCents = useMemo(() => {
    if (isApiMode) {
      return summaryData?.totals.assigned_total_cents ?? 0;
    }
    if (!draft) return 0;
    let assignedSubtotal = 0;
    for (const line of draft.lines) {
      if ((assignments[line.id]?.length ?? 0) > 0) {
        assignedSubtotal += line.amountCents;
      }
    }
    if (assignedSubtotal === 0) return 0;
    if (linesSubtotalCents <= 0) return assignedSubtotal;
    const ratio = assignedSubtotal / linesSubtotalCents;
    const feesCents = draft.vatCents + draft.serviceFeeCents;
    return Math.round(assignedSubtotal + feesCents * ratio);
  }, [
    assignments,
    draft,
    isApiMode,
    linesSubtotalCents,
    summaryData?.totals.assigned_total_cents,
  ]);

  const assignedLineCount = useMemo(() => {
    if (isApiMode) {
      return lines.filter(
        (line) => (displayAssignments[line.id]?.length ?? 0) > 0,
      ).length;
    }
    if (!draft) return 0;
    return draft.lines.filter((l) => (assignments[l.id]?.length ?? 0) > 0)
      .length;
  }, [assignments, displayAssignments, draft, isApiMode, lines]);

  const assignmentLineTotal = isApiMode
    ? (summaryData?.bill.items_count ?? lines.length)
    : (draft?.lines.length ?? 0);

  const assignmentProgressPct = useMemo(() => {
    if (assignmentLineTotal === 0) return 0;
    return Math.round((assignedLineCount / assignmentLineTotal) * 100);
  }, [assignedLineCount, assignmentLineTotal]);

  const unassignedLineCount = useMemo(() => {
    if (isApiMode) {
      return Math.max(0, lines.length - assignedLineCount);
    }
    if (!draft) return 0;
    return draft.lines.length - assignedLineCount;
  }, [assignedLineCount, draft, isApiMode, lines.length]);

  const allLinesAssigned = useMemo(() => {
    if (assignmentLineTotal === 0) return false;
    if (isApiMode) {
      return lines.length > 0 && assignedLineCount === lines.length;
    }
    if (!draft) return false;
    return draft.lines.every((l) => (assignments[l.id]?.length ?? 0) > 0);
  }, [
    assignedLineCount,
    assignmentLineTotal,
    assignments,
    draft,
    isApiMode,
    lines.length,
  ]);

  const fullEvenSplit = useMemo(
    () =>
      draft
        ? isBillSplitEquallyAmongAll(draft.lines, members, assignments)
        : false,
    [draft, members, assignments],
  );

  const canUndoSplitEqually =
    !isApiMode && fullEvenSplit && assignmentsBeforeSplitRef.current !== null;

  const showAssignmentError = useCallback((error: unknown) => {
    const message = isApiError(error)
      ? error.message
      : "Could not save assignment. Please try again.";
    setAssignmentError(message);
  }, []);

  const persistLineAssignments = useCallback(
    (lineId: string, participantIds: string[]) => {
      const receiptItemId = Number(lineId);
      if (!Number.isFinite(receiptItemId)) {
        return;
      }

      const numericParticipantIds = participantIds
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id));

      replaceItemAssignments.mutate(
        {
          receiptItemId,
          participantIds: numericParticipantIds,
        },
        { onError: showAssignmentError },
      );
    },
    [replaceItemAssignments, showAssignmentError],
  );

  const toggleAssignment = useCallback(
    (lineId: string, memberId: string) => {
      const current = displayAssignments[lineId] ?? [];
      const nextIds = current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId];

      if (isApiMode) {
        persistLineAssignments(lineId, nextIds);
        return;
      }

      setAssignments((prev) => ({ ...prev, [lineId]: nextIds }));
    },
    [displayAssignments, isApiMode, persistLineAssignments],
  );

  const handleSplitEqually = useCallback(() => {
    if (isApiMode) {
      bulkAssignments.splitAllEqually.mutate(undefined, {
        onError: showAssignmentError,
      });
      return;
    }
    if (!draft || members.length === 0) return;
    const all = members.map((x) => x.id);
    setAssignments((prev) => {
      if (
        assignmentsBeforeSplitRef.current === null &&
        isBillSplitEquallyAmongAll(draft.lines, members, prev)
      ) {
        return prev;
      }
      assignmentsBeforeSplitRef.current = cloneAssignments(prev);
      const next: Assignments = {};
      for (const line of draft.lines) {
        next[line.id] = [...all];
      }
      return next;
    });
  }, [
    bulkAssignments.splitAllEqually,
    draft,
    isApiMode,
    members,
    showAssignmentError,
  ]);

  const handleUndoSplitEqually = useCallback(() => {
    const snap = assignmentsBeforeSplitRef.current;
    if (snap === null) return;
    setAssignments(cloneAssignments(snap));
    assignmentsBeforeSplitRef.current = null;
  }, []);

  const handleSplitUnassignedItems = useCallback(() => {
    if (isApiMode) {
      bulkAssignments.splitUnassignedEqually.mutate(undefined, {
        onError: showAssignmentError,
      });
      return;
    }
    if (!draft || members.length === 0) return;
    const all = members.map((m) => m.id);
    setAssignments((prev) => {
      const next = { ...prev };
      for (const line of draft.lines) {
        if ((next[line.id]?.length ?? 0) === 0) {
          next[line.id] = [...all];
        }
      }
      return next;
    });
  }, [
    bulkAssignments.splitUnassignedEqually,
    draft,
    isApiMode,
    members,
    showAssignmentError,
  ]);

  const addMemberWithName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }

      if (isApiMode) {
        const seatIndex = members.length;
        billParticipants.createParticipant.mutate(
          { participant: buildParticipantInput(trimmed, seatIndex) },
          {
            onError: showAssignmentError,
            onSuccess: (response) => {
              setActiveMemberId(String(response.participant.id));
            },
          },
        );
        return;
      }

      const id = `m-${Date.now().toString(36)}`;
      setMembers((prev) => {
        const i = prev.length;
        return [
          {
            id,
            name: trimmed,
            tone: memberChipBorderToneForIndex(i),
            ...avatarTonesForPaletteIndex(i),
          },
          ...prev,
        ];
      });
      setActiveMemberId(id);
    },
    [
      billParticipants.createParticipant,
      isApiMode,
      members.length,
      showAssignmentError,
    ],
  );

  const handleAddMember = useCallback(() => {
    const isIOS = typeof Alert.prompt === "function";
    if (isIOS) {
      Alert.prompt(
        "Add Member",
        "Who's splitting this bill?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add",
            onPress: (name?: string) => {
              if (name) {
                addMemberWithName(name);
              }
            },
          },
        ],
        "plain-text",
      );
      return;
    }

    addMemberWithName(`Person ${members.length + 1}`);
  }, [addMemberWithName, members.length]);

  const handleManagePeople = useCallback(() => {
    Alert.alert(
      "Manage people",
      "Use + Add beside People to add someone. Tap a person, then tap receipt lines to assign items to them.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Add person", onPress: () => handleAddMember() },
      ],
    );
  }, [handleAddMember]);

  const handleClearAssignments = useCallback(() => {
    Alert.alert(
      "Clear assignments?",
      "Everyone will be removed from every line. You can assign again anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            if (isApiMode) {
              bulkAssignments.clearBillAssignments.mutate(undefined, {
                onError: showAssignmentError,
                onSuccess: () => setActiveMemberId(null),
              });
              return;
            }

            setAssignments({});
            assignmentsBeforeSplitRef.current = null;
            setActiveMemberId(null);
          },
        },
      ],
    );
  }, [bulkAssignments.clearBillAssignments, isApiMode, showAssignmentError]);

  const handleSummary = useCallback(() => {
    if (isApiMode) {
      router.push(`/bill/${billId}`);
      return;
    }
    if (!draft) {
      router.push("/scan/summary");
      return;
    }
    const payload = {
      draft: cloneBillDraft(draft),
      assignments: cloneAssignments(assignments),
      members: members.map((m) => ({ id: m.id, name: m.name })),
    };
    router.push({
      pathname: "/scan/summary",
      params: { data: JSON.stringify(payload) },
    });
  }, [router, draft, assignments, members, billId, isApiMode]);

  const onLinePress = useCallback(
    (line: AssignLine | ReceiptLine) => {
      if (activeMemberId) {
        toggleAssignment(line.id, activeMemberId);
        return;
      }
      setSheetLineId(line.id);
    },
    [activeMemberId, toggleAssignment],
  );

  const merchantTopHint = isApiMode
    ? apiAssignData?.merchantLabel
    : draft?.merchant && draft.merchant.length > 0
      ? draft.merchant
      : undefined;

  const formatAmount = isApiMode ? formatMoneyFromCents : undefined;
  const peopleSectionTitle = isApiMode ? "Assign to" : "People";
  const peopleSectionSubtitle = isApiMode
    ? "Select a person, then tap items to assign"
    : "Select one or more to bulk assign";

  if (isApiMode && billId <= 0) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <AppText className="text-center text-base text-muted-foreground">
          This bill link is invalid.
        </AppText>
        <Button className="mt-6 w-full" onPress={() => router.back()}>
          Go Back
        </Button>
      </ScreenContainer>
    );
  }

  if (isApiMode && (billLoading || summaryLoading)) {
    return (
      <ScreenContainer className="flex-1">
        <ScreenHeader title="Assign Items" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator accessibilityLabel="Loading bill assignments" />
          <AppText className="text-sm text-muted">Loading bill…</AppText>
        </View>
      </ScreenContainer>
    );
  }

  if (isApiMode && (billError || summaryError)) {
    const loadError = billLoadError ?? summaryLoadError;
    const message = isApiError(loadError)
      ? loadError.message
      : "Something went wrong loading this bill.";

    return (
      <ScreenContainer className="flex-1">
        <ScreenHeader title="Assign Items" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <AppText className="text-center text-sm text-foreground">
            {message}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading bill"
            className="rounded-xl border border-borderSubtle px-4 py-2 active:opacity-70"
            onPress={() => {
              void refetchBill();
              void refetchSummary();
            }}
          >
            <AppText className="text-sm font-medium text-foreground">
              Try again
            </AppText>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (isApiMode && (!billData || !summaryData || !apiAssignData)) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <AppText className="text-center text-base text-muted-foreground">
          No assignment data for this bill.
        </AppText>
        <Button className="mt-6 w-full" onPress={() => router.back()}>
          Go Back
        </Button>
      </ScreenContainer>
    );
  }

  if (!isApiMode && !paramsReady(draftParam)) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <AppText className="text-center text-base text-muted-foreground">
          Nothing to assign. Go back and review a receipt first.
        </AppText>
        <Button className="mt-6 w-full" onPress={() => router.back()}>
          Go Back
        </Button>
      </ScreenContainer>
    );
  }

  if (!isApiMode && !hydrated) {
    return (
      <ScreenContainer className="items-center justify-center">
        <AppText className="text-muted-foreground">Loading…</AppText>
      </ScreenContainer>
    );
  }

  if (!isApiMode && !draft) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <AppText className="text-center text-base text-muted-foreground">
          This receipt could not be loaded. Go back and try Continue again.
        </AppText>
        <Button className="mt-6 w-full" onPress={() => router.back()}>
          Go Back
        </Button>
      </ScreenContainer>
    );
  }

  if (isApiMode && lines.length === 0) {
    return (
      <ScreenContainer className="flex-1">
        <ScreenHeader
          title="Assign Items"
          topHint={merchantTopHint}
          onBack={() => router.back()}
        />
        <View className="flex-1 items-center justify-center px-6">
          <AppText className="text-center text-sm text-muted">
            No receipt items to assign on this bill yet.
          </AppText>
          <Button
            className="mt-6 w-full"
            onPress={() =>
              router.push({
                pathname: "/scan/review",
                params: { billId: String(billId) },
              })
            }
          >
            Review receipt
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  if (isApiMode && members.length === 0) {
    return (
      <ScreenContainer className="flex-1">
        <ScreenHeader
          title="Assign Items"
          topHint={merchantTopHint}
          onBack={() => router.back()}
        />
        <View className="flex-1 items-center justify-center px-6">
          <AppText className="text-center text-sm text-muted">
            No participants on this bill yet.
          </AppText>
          <Button className="mt-6 w-full" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  const activeAssignMember =
    activeMemberId !== null ? (memberById.get(activeMemberId) ?? null) : null;

  const assignOverflowMenuTop = insets.top + 84;
  const sheetLine =
    sheetLineId !== null
      ? (lines.find((line) => line.id === sheetLineId) ?? null)
      : null;

  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader
        className="pb-4"
        title="Assign Items"
        topHint={merchantTopHint}
        onBack={() => router.back()}
        rightSlot={
          <Pressable
            accessibilityLabel="More options"
            className="h-10 w-10 items-center justify-center rounded-full border border-borderSubtle bg-white active:opacity-85 dark:bg-background"
            hitSlop={10}
            onPress={() => setOverflowMenuOpen(true)}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={colors.foreground}
            />
          </Pressable>
        }
      />

      <View className="flex-1 bg-stone-50 dark:bg-neutral-950/50">
        <View className="px-0 pb-1 pt-1">
          <View className="flex-row items-start gap-3 px-4 pb-3 pt-3">
            <View className="size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 dark:bg-violet-500/20">
              <Ionicons name="people" size={22} color="#7c3aed" />
            </View>
            <View className="min-w-0 flex-1 pt-0.5">
              <AppText className="text-lg font-bold tracking-tight text-foreground">
                {peopleSectionTitle}
              </AppText>
              <AppText className="mt-0.5 text-[13px] leading-snug text-muted">
                {peopleSectionSubtitle}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add Member"
              className="mt-0.5 shrink-0 flex-row items-center gap-1 rounded-full border border-borderSubtle bg-white px-3.5 py-2.5 active:opacity-80 dark:bg-neutral-900"
              onPress={handleAddMember}
            >
              <Ionicons name="add" size={18} color={colors.foreground} />
              <AppText className="text-sm font-semibold text-foreground">
                Add
              </AppText>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            accessibilityHint={
              activeMemberId
                ? `Tap receipt lines to add or remove ${memberById.get(activeMemberId)?.name ?? "the selected person"}.`
                : "Tap a line to choose who shared it, or select a person to tag lines quickly."
            }
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            className="pb-4 pt-1"
            contentContainerClassName="flex-row items-center gap-2 px-4"
          >
            {members.map((m) => {
              const active = m.id === activeMemberId;
              const isYou =
                m.isHost === true ||
                m.id === "m-you" ||
                m.name.trim().toLowerCase() === "you";
              return (
                <Pressable
                  key={m.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Assign to ${m.name}`}
                  className={assignMemberChipPressableClassName(active, m.tone)}
                  onPress={() =>
                    setActiveMemberId((prev) => (prev === m.id ? null : m.id))
                  }
                >
                  <AssignMemberChipFace
                    avatarBackgroundColor={m.avatarBackgroundColor}
                    avatarTextColor={m.avatarTextColor}
                    initialsText={participantInitials(m.name)}
                    name={m.name}
                    showYouRibbon={isYou}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-5 px-4 pt-3"
            contentContainerStyle={{
              paddingBottom: 24 + insets.bottom + 72,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {assignmentError ? (
              <NoticeBanner
                dismissAccessibilityLabel="Dismiss assignment error"
                icon="alert-circle-outline"
                message={assignmentError}
                variant="sky"
                onDismiss={() => setAssignmentError(null)}
              />
            ) : null}

            {activeAssignMember ? (
              <NoticeBanner
                chrome={memberAssignHighlightFromTones(activeAssignMember)}
                dismissAccessibilityLabel="Stop assigning to this person"
                icon="people-outline"
                message={`Assigning to ${activeAssignMember.name} — tap items to add or remove`}
                onDismiss={() => setActiveMemberId(null)}
              />
            ) : null}
            <View className="gap-3">
              {/*
              <View
                accessibilityLabel={`Assignment progress: ${assignedLineCount} of ${draft.lines.length} items assigned, ${assignmentProgressPct} percent`}
                className="rounded-2xl border border-violet-200/70 bg-violet-50 px-4 py-4 dark:border-violet-800/35 dark:bg-violet-950/30"
              >
                <View className="flex-row items-start gap-2">
                  <View className="min-w-0 flex-1 pr-1">
                    <AppText className="text-[13px] font-semibold text-muted">
                      Assignment progress
                    </AppText>
                    <AppText className="mt-1 text-[17px] font-bold leading-snug text-foreground">
                      {unassignedLineCount === 0
                        ? "All items assigned"
                        : `${unassignedLineCount} ${unassignedLineCount === 1 ? "item needs" : "items need"} assignment`}
                    </AppText>
                    <AppText className="mt-1 text-[13px] leading-snug text-muted">
                      Pick people above, then tap items.
                    </AppText>
                    <AppText className="mt-2 text-[12px] leading-snug text-muted">
                      {assignedLineCount}/{draft.lines.length} assigned •{" "}
                      {formatZAR(assignedItemsTotalCents)} assigned of{" "}
                      {formatZAR(billGrandTotalCents)}
                    </AppText>
                  </View>
                  <Image
                    accessibilityElementsHidden
                    className="h-24 w-24 shrink-0"
                    resizeMode="contain"
                    source={require("../../../assets/images/assignment-progress-illustration.png")}
                  />
                </View>

                <View className="mt-4 flex-row items-center gap-3">
                  <View className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-neutral-700">
                    <View
                      className="h-full rounded-l-full bg-violet-600 dark:bg-violet-500"
                      style={{
                        width: `${assignmentProgressPct}%`,
                      }}
                    />
                  </View>
                  <AppText className="w-9 shrink-0 text-right text-[13px] font-bold tabular-nums text-violet-700 dark:text-violet-300">
                    {assignmentProgressPct}%
                  </AppText>
                </View>
              </View>
              */}

              <View className="flex-row items-start gap-3">
                <View className="size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 dark:bg-violet-500/20">
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color="#7c3aed"
                  />
                </View>
                <View className="min-w-0 flex-1 pb-1 pt-0.5">
                  <View className="flex-row items-center gap-2">
                    <AppText
                      className="min-w-0 flex-1 text-lg font-bold tracking-tight text-foreground"
                      numberOfLines={1}
                    >
                      Items to assign
                    </AppText>
                    <View
                      accessible={false}
                      className="shrink-0 flex-row items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 dark:bg-violet-950/50"
                    >
                      <AppText className="text-[13px] font-semibold text-violet-700 dark:text-violet-300">
                        Sort
                      </AppText>
                      <Ionicons
                        name="options-outline"
                        size={16}
                        color={scheme === "dark" ? "#c4b5fd" : "#6d28d9"}
                      />
                    </View>
                  </View>
                  <AppText className="mt-0.5 text-[13px] leading-snug text-muted">
                    Tap an item to assign or edit split.
                  </AppText>
                </View>
              </View>
            </View>
            <View className="mx-1.5 gap-0">
              {lines.map((line, index) => {
                const ids = displayAssignments[line.id] || [];
                const assigned = ids
                  .map((id) => memberById.get(id))
                  .filter((x): x is Member => x !== undefined);

                return (
                  <View
                    key={line.id}
                    className={cn(
                      "overflow-hidden rounded-2xl border border-stone-200/30 bg-white shadow-sm shadow-stone-900/5 dark:border-neutral-800/45 dark:bg-neutral-900 dark:shadow-none",
                      index > 0 && "-mt-px",
                    )}
                  >
                    <AssignLineRow
                      assigned={assigned}
                      formatAmount={formatAmount}
                      index={index}
                      line={line}
                      lineHint={
                        activeMemberId
                          ? "Adds or removes the selected person on this line."
                          : "Opens who shared this item."
                      }
                      unassignedLabel="Tap to assign"
                      variant="assign"
                      onPress={() => onLinePress(line)}
                    />
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <View
            pointerEvents="box-none"
            className="absolute bottom-0 left-0 right-0 z-10 px-4 pt-0"
            style={{
              backgroundColor: "transparent",
              paddingBottom: insets.bottom,
            }}
          >
            <View className="flex-row items-stretch gap-2 rounded-2xl border border-borderSubtle bg-background px-3 py-3 shadow-lg shadow-black/20">
              <View className="min-w-0 flex-1 basis-0 flex-row items-center pr-1.5">
                <View className="size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 dark:bg-violet-500/20">
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color="#7c3aed"
                  />
                </View>
                <View className="min-w-0 justify-center pl-2">
                  <AppText className="text-[11px] leading-tight text-muted">
                    Assigned total
                  </AppText>
                  <AnimatedZarAmount
                    cents={assignedItemsTotalCents}
                    style={{
                      marginTop: 2,
                      fontSize: 20,
                      fontWeight: "700",
                      fontVariant: ["tabular-nums"],
                      color: colors.foreground,
                      lineHeight: 24,
                    }}
                  />
                  <AppText className="mt-0.5 text-[11px] leading-tight text-muted">
                    {assignedLineCount} of {assignmentLineTotal} items assigned
                  </AppText>
                </View>
              </View>

              <View className="min-w-0 flex-1 basis-0 self-stretch pl-1.5">
                <Button
                  accessibilityLabel={
                    isApiMode ? "View bill summary" : "View Summary"
                  }
                  className="h-full w-full min-w-0 self-stretch flex-row items-center justify-center gap-1 rounded-xl px-3 py-0"
                  disabled={!allLinesAssigned}
                  onPress={handleSummary}
                >
                  <AppText
                    className={cn(
                      "text-base font-semibold",
                      allLinesAssigned
                        ? "text-background"
                        : "text-neutral-600 dark:text-neutral-300",
                    )}
                  >
                    {isApiMode ? "View summary" : "View Summary"}
                  </AppText>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={allLinesAssigned ? colors.background : colors.muted}
                  />
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>

      <AssignOverflowMenu
        top={assignOverflowMenuTop}
        visible={overflowMenuOpen}
        onClearAssignments={handleClearAssignments}
        onClose={() => setOverflowMenuOpen(false)}
        onManagePeople={handleManagePeople}
        onSplitAllEqually={handleSplitEqually}
        onSplitUnassignedItems={handleSplitUnassignedItems}
        onUndoSplitEqually={handleUndoSplitEqually}
        showUndoSplitEqually={canUndoSplitEqually}
      />

      <AssignItemSheet
        key={sheetLineId ?? "_"}
        bottomInset={insets.bottom}
        initialSelectedIds={
          sheetLineId ? [...(displayAssignments[sheetLineId] ?? [])] : []
        }
        line={sheetLine}
        members={members}
        visible={sheetLineId !== null}
        onClose={() => setSheetLineId(null)}
        onSave={(memberIds) => {
          if (sheetLineId === null) return;

          if (isApiMode) {
            persistLineAssignments(sheetLineId, memberIds);
            setSheetLineId(null);
            return;
          }

          setAssignments((prev) => ({
            ...prev,
            [sheetLineId]: memberIds,
          }));
        }}
      />
    </ScreenContainer>
  );
}

function paramsReady(draftParam: string | undefined): boolean {
  return typeof draftParam === "string" && draftParam.length > 0;
}
