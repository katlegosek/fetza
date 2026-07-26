import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenContainer, ScreenHeader } from "@/components";
import { useAppColorScheme, useThemeColors } from "@/hooks";
import { AssignEmptyState } from "@/reference/mock-flow/AssignEmptyState";
import {
  cloneAssignments,
  isDraftParamReady,
} from "@/reference/mock-flow/assign-mock.helpers";
import { useAssignBulkActions } from "@/reference/mock-flow/assign/hooks/useAssignBulkActions";
import { useAssignMockData } from "@/reference/mock-flow/assign/hooks/useAssignMockData";
import { useAssignMockState } from "@/reference/mock-flow/assign/hooks/useAssignMockState";
import {
  cloneBillDraft,
  generateLineId,
} from "@/reference/mock-flow/draft-bill.helpers";
import { AssignBottomBar } from "@/screens/assign/AssignBottomBar";
import { AssignItemsList } from "@/screens/assign/AssignItemsList";
import { AssignPeopleRow } from "@/screens/assign/AssignPeopleRow";
import type { AssignSheetState } from "@/screens/assign/assign.constants";
import type { AssignMember } from "@/screens/assign/assign.constants";
import {
  AssignItemSheet,
  AssignOverflowMenu,
} from "@/screens/assign/components";
import { useAssignActiveMember } from "@/screens/assign/hooks/useAssignActiveMember";
import { useAssignAssignmentError } from "@/screens/assign/hooks/useAssignAssignmentError";
import { useAssignItemMutations } from "@/screens/assign/hooks/useAssignItemMutations";
import { useAssignParticipants } from "@/screens/assign/hooks/useAssignParticipants";
import type { AssignLine } from "@/screens/assign/mappers/bill-to-assign";
import {
  ClearReceiptSheet,
  ReviewMerchantSheet,
  ReviewTotalsSheet,
  type SaveBillFees,
} from "@/screens/review/components";
import type { ReceiptLine } from "@/types/draft-bill";

/**
 * Mock fallback for local/demo flows without `billId` (optional `draft` param).
 * API mode is {@link AssignApiScreen} — the primary path when `billId > 0`.
 *
 * TODO(production): Remove — API-only assign. See docs/DEV_ONLY_TODOS.md
 */
export type AssignMockScreenProps = {
  draftParam?: string;
};

export const AssignMockScreen = ({ draftParam }: AssignMockScreenProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const scheme = useAppColorScheme();

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

  const progress = useAssignMockData({
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
          <AssignOverflowMenu
            iconColor={colors.foreground}
            intensity={scheme === "dark" ? 24 : 18}
            tint={scheme === "dark" ? "dark" : "light"}
            onClearAssignments={() => setClearReceiptOpen(true)}
            onManagePeople={handleManagePeople}
            onSplitAllEqually={bulkActions.handleSplitEqually}
            onSplitUnassignedItems={bulkActions.handleSplitUnassignedItems}
            onUndoSplitEqually={bulkActions.handleUndoSplitEqually}
            showUndoSplitEqually={bulkActions.canUndoSplitEqually}
          />
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
