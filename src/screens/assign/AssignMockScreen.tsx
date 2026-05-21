import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AssignItemSheet,
  AssignOverflowMenu,
  ClearReceiptSheet,
  ReviewMerchantSheet,
  ReviewTotalsSheet,
  type SaveBillFees,
  ScreenContainer,
  ScreenHeader,
} from "@/components";
import { useThemeColors } from "@/hooks";
import { cloneBillDraft, generateLineId } from "@/lib/helper";
import type { ReceiptLine } from "@/mocks/review-draft.mock";
import { AssignBottomBar } from "@/screens/assign/AssignBottomBar";
import { AssignEmptyState } from "@/screens/assign/AssignEmptyState";
import { AssignItemsList } from "@/screens/assign/AssignItemsList";
import { AssignPeopleRow } from "@/screens/assign/AssignPeopleRow";
import type { AssignSheetState } from "@/screens/assign/assign.constants";
import type { AssignMember } from "@/screens/assign/assign.constants";
import {
  assignOverflowMenuTop,
  cloneAssignments,
  isDraftParamReady,
} from "@/screens/assign/assign.helpers";
import { useAssignActiveMember } from "@/screens/assign/hooks/useAssignActiveMember";
import { useAssignAssignmentError } from "@/screens/assign/hooks/useAssignAssignmentError";
import { useAssignBulkActions } from "@/screens/assign/hooks/useAssignBulkActions";
import { useAssignData } from "@/screens/assign/hooks/useAssignData";
import { useAssignItemMutations } from "@/screens/assign/hooks/useAssignItemMutations";
import { useAssignMockState } from "@/screens/assign/hooks/useAssignMockState";
import { useAssignParticipants } from "@/screens/assign/hooks/useAssignParticipants";
import type { AssignLine } from "@/utils/bill-to-assign";

// TODO(production): Remove mock assign path (no billId / SEED_* data) — API-only. See docs/DEV_ONLY_TODOS.md
export type AssignMockScreenProps = {
  draftParam?: string;
};

export const AssignMockScreen = ({ draftParam }: AssignMockScreenProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const { activeMemberId, activeMemberIdRef, setActiveMember } =
    useAssignActiveMember();
  const { assignmentError, setAssignmentError } = useAssignAssignmentError();

  const {
    draft,
    setDraft,
    hydrated,
    members,
    setMembers,
    assignments,
    setAssignments,
    assignmentsBeforeSplitRef,
    resetAssignmentsBeforeSplit,
    snapshotAssignmentsBeforeSplit,
    restoreAssignmentsBeforeSplit,
  } = useAssignMockState(draftParam);

  const [sheet, setSheet] = useState<AssignSheetState>(null);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [clearReceiptOpen, setClearReceiptOpen] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when draft route param changes
  useEffect(() => {
    setActiveMember(null);
  }, [draftParam, setActiveMember]);

  const closeSheet = useCallback(() => {
    setSheet(null);
  }, []);

  const mockLines = draft?.lines ?? [];
  const lines: Array<AssignLine | ReceiptLine> = mockLines;
  const displayAssignments = assignments;

  const memberById = useMemo(() => {
    const map = new Map<string, AssignMember>();
    for (const member of members) {
      map.set(member.id, member);
    }
    return map;
  }, [members]);

  const progress = useAssignData({
    isApiMode: false,
    lines,
    displayAssignments,
    draft,
    mockAssignments: assignments,
    draftLines: mockLines,
    apiLines: [],
  });

  const { toggleAssignment } = useAssignItemMutations({
    billId: 0,
    isApiMode: false,
    displayAssignments,
    setAssignments,
    showAssignmentError: () => undefined,
  });

  const bulkActions = useAssignBulkActions({
    draft,
    members,
    assignments,
    setAssignments,
    assignmentsBeforeSplitRef,
    resetAssignmentsBeforeSplit,
    snapshotAssignmentsBeforeSplit,
    restoreAssignmentsBeforeSplit,
    setActiveMember,
  });

  const { handleAddMember, handleManagePeople } = useAssignParticipants({
    billId: 0,
    isApiMode: false,
    members,
    setMembers,
    setActiveMember,
    showAssignmentError: () => undefined,
  });

  const saveMerchant = useCallback(
    (name: string) => {
      setDraft((current) =>
        current ? { ...current, merchant: name } : current,
      );
    },
    [setDraft],
  );

  const saveBillFees = useCallback(
    (next: SaveBillFees) => {
      setDraft((current) =>
        current
          ? {
              ...current,
              vatCents: next.vatCents,
              serviceFeeCents: next.serviceFeeCents,
            }
          : current,
      );
    },
    [setDraft],
  );

  const confirmClearReceipt = useCallback(() => {
    setDraft({
      merchant: "",
      billId: `draft-${Date.now()}`,
      timestamp: "",
      lines: [
        {
          id: generateLineId(),
          qty: 1,
          description: "",
          amountCents: 0,
        },
      ],
      vatCents: 0,
      serviceFeeCents: 0,
    });
  }, [setDraft]);

  const onLinePress = useCallback(
    (line: AssignLine | ReceiptLine) => {
      const selectedMemberId = activeMemberIdRef.current;
      if (selectedMemberId) {
        toggleAssignment(line.id, selectedMemberId);
        return;
      }
      setSheet({ kind: "line", lineId: line.id });
    },
    [activeMemberIdRef, toggleAssignment],
  );

  const handleSummary = useCallback(() => {
    if (!draft) {
      router.push("/scan/summary");
      return;
    }
    const payload = {
      draft: cloneBillDraft(draft),
      assignments: cloneAssignments(assignments),
      members: members.map((member) => ({ id: member.id, name: member.name })),
    };
    router.push({
      pathname: "/scan/summary",
      params: { data: JSON.stringify(payload) },
    });
  }, [assignments, draft, members, router]);

  if (!isDraftParamReady(draftParam)) {
    return (
      <AssignEmptyState variant="no-draft-param" onBack={() => router.back()} />
    );
  }

  if (!hydrated) {
    return (
      <AssignEmptyState variant="draft-loading" onBack={() => router.back()} />
    );
  }

  if (!draft) {
    return (
      <AssignEmptyState
        variant="draft-load-failed"
        onBack={() => router.back()}
      />
    );
  }

  const activeAssignMember =
    activeMemberId !== null ? (memberById.get(activeMemberId) ?? null) : null;

  const activeLine =
    sheet?.kind === "line"
      ? draft.lines.find((line) => line.id === sheet.lineId)
      : undefined;

  const sheetLine =
    sheet?.kind === "line"
      ? (lines.find((line) => line.id === sheet.lineId) ?? null)
      : null;

  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader
        className="pb-4"
        title="Assign Items"
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
        <AssignPeopleRow
          activeMemberId={activeMemberId}
          foregroundColor={colors.foreground}
          members={members}
          peopleSectionSubtitle="Select one or more to bulk assign"
          peopleSectionTitle="People"
          onAddMember={handleAddMember}
          onCloseSheet={closeSheet}
          onSelectMember={setActiveMember}
        />

        <View className="flex-1">
          <AssignItemsList
            activeAssignMember={activeAssignMember}
            activeMemberId={activeMemberId}
            assignmentError={assignmentError}
            displayAssignments={displayAssignments}
            lines={lines}
            memberById={memberById}
            members={members}
            scrollPaddingBottom={24 + insets.bottom + 72}
            onDismissActiveMember={() => setActiveMember(null)}
            onDismissAssignmentError={() => setAssignmentError(null)}
            onLinePress={onLinePress}
          />

          <AssignBottomBar
            allLinesAssigned={progress.allLinesAssigned}
            assignedItemsTotalCents={progress.assignedItemsTotalCents}
            backgroundColor={colors.background}
            bottomInset={insets.bottom}
            foregroundColor={colors.foreground}
            isApiMode={false}
            itemCountLabel={`${draft.lines.length} items detected`}
            mutedColor={colors.muted}
            onSummaryPress={handleSummary}
          />
        </View>
      </View>

      <ReviewMerchantSheet
        bottomInset={insets.bottom}
        merchant={draft.merchant}
        visible={sheet?.kind === "merchant"}
        onClose={closeSheet}
        onSave={saveMerchant}
      />

      <ReviewTotalsSheet
        bottomInset={insets.bottom}
        serviceFeeCents={draft.serviceFeeCents}
        subtotalCents={progress.linesSubtotalCents}
        vatCents={draft.vatCents}
        visible={sheet?.kind === "totals"}
        onClose={closeSheet}
        onSave={saveBillFees}
      />

      <AssignOverflowMenu
        top={assignOverflowMenuTop(insets.top)}
        visible={overflowMenuOpen}
        onClearAssignments={() => setClearReceiptOpen(true)}
        onClose={() => setOverflowMenuOpen(false)}
        onManagePeople={handleManagePeople}
        onSplitAllEqually={bulkActions.handleSplitEqually}
        onSplitUnassignedItems={bulkActions.handleSplitUnassignedItems}
        onUndoSplitEqually={bulkActions.handleUndoSplitEqually}
        showUndoSplitEqually={bulkActions.canUndoSplitEqually}
      />

      <ClearReceiptSheet
        bottomInset={insets.bottom}
        visible={clearReceiptOpen}
        onClose={() => setClearReceiptOpen(false)}
        onConfirmClear={confirmClearReceipt}
      />

      <AssignItemSheet
        key={sheet?.kind === "line" ? sheet.lineId : "_"}
        bottomInset={insets.bottom}
        initialSelectedIds={
          sheet?.kind === "line"
            ? [...(displayAssignments[sheet.lineId] ?? [])]
            : []
        }
        line={sheetLine}
        members={members}
        visible={sheet?.kind === "line" && activeLine !== undefined}
        onClose={closeSheet}
        onSave={(memberIds) => {
          if (sheet?.kind !== "line") return;

          setAssignments((previous) => ({
            ...previous,
            [sheet.lineId]: memberIds,
          }));
        }}
      />
    </ScreenContainer>
  );
};
