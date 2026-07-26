import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/api-error-message";
import {
  ScreenContainer,
  ScreenErrorState,
  ScreenHeader,
  ScreenLoadingState,
} from "@/components";
import { useAppColorScheme, useThemeColors } from "@/hooks";
import { FEEDBACK_MESSAGES, SCREEN_TITLES } from "@/lib/screen-feedback-copy";
import { AssignBottomBar } from "@/screens/assign/AssignBottomBar";
import { AssignEmptyState } from "@/screens/assign/AssignEmptyState";
import { AssignItemsList } from "@/screens/assign/AssignItemsList";
import { AssignPeopleRow } from "@/screens/assign/AssignPeopleRow";
import type { AssignMember } from "@/screens/assign/assign.constants";
import {
  AssignItemSheet,
  AssignOverflowMenu,
} from "@/screens/assign/components";
import { useAssignActiveMember } from "@/screens/assign/hooks/useAssignActiveMember";
import { useAssignApiBulkActions } from "@/screens/assign/hooks/useAssignApiBulkActions";
import { useAssignApiData } from "@/screens/assign/hooks/useAssignApiData";
import { useAssignAssignmentError } from "@/screens/assign/hooks/useAssignAssignmentError";
import { useAssignData } from "@/screens/assign/hooks/useAssignData";
import { useAssignItemMutations } from "@/screens/assign/hooks/useAssignItemMutations";
import { useAssignParticipants } from "@/screens/assign/hooks/useAssignParticipants";
import type { AssignLine } from "@/screens/assign/mappers/bill-to-assign";
import type { ReceiptLine } from "@/types/draft-bill";
import { formatMoneyFromCents } from "@/utils/money";

/** Primary assign path: bill participants, items, and assignments from the API. */
export type AssignApiScreenProps = {
  billId: number;
};

export const AssignApiScreen = ({ billId }: AssignApiScreenProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const scheme = useAppColorScheme();

  const {
    billData,
    summaryData,
    apiAssignData,
    isLoading,
    isError,
    loadError,
    refetchBill,
    refetchSummary,
  } = useAssignApiData(billId);

  const { activeMemberId, activeMemberIdRef, setActiveMember } =
    useAssignActiveMember();
  const { assignmentError, setAssignmentError, showAssignmentError } =
    useAssignAssignmentError();

  const [sheetLineId, setSheetLineId] = useState<string | null>(null);

  const apiLines = apiAssignData?.lines ?? [];
  const apiMembers = apiAssignData?.members ?? [];
  const apiAssignments = apiAssignData?.assignments ?? {};
  const members = apiMembers;
  const lines: Array<AssignLine | ReceiptLine> = apiLines;
  const displayAssignments = apiAssignments;

  const memberById = useMemo(() => {
    const map = new Map<string, AssignMember>();
    for (const member of members) {
      map.set(member.id, member);
    }
    return map;
  }, [members]);

  const progress = useAssignData({
    lines,
    displayAssignments,
    summaryData,
  });

  const { persistLineAssignments, toggleAssignment } = useAssignItemMutations({
    billId,
    isApiMode: true,
    displayAssignments,
    showAssignmentError,
  });

  const bulkActions = useAssignApiBulkActions({
    billId,
    setActiveMember,
    showAssignmentError,
  });

  const { handleAddMember, handleManagePeople } = useAssignParticipants({
    billId,
    isApiMode: true,
    members,
    setActiveMember,
    setAssignmentError,
    showAssignmentError,
  });

  const merchantTopHint = apiAssignData?.merchantLabel;

  const onLinePress = useCallback(
    (line: AssignLine | ReceiptLine) => {
      const selectedMemberId = activeMemberIdRef.current;
      if (selectedMemberId) {
        toggleAssignment(line.id, selectedMemberId);
        return;
      }
      setSheetLineId(line.id);
    },
    [activeMemberIdRef, toggleAssignment],
  );

  const handleBack = useCallback(() => router.back(), [router]);

  const handleSummary = useCallback(() => {
    router.push(`/bill/${billId}`);
  }, [billId, router]);

  if (billId <= 0) {
    return <AssignEmptyState variant="invalid-bill" onBack={handleBack} />;
  }

  if (isLoading) {
    return (
      <ScreenLoadingState
        title={SCREEN_TITLES.assign}
        message={FEEDBACK_MESSAGES.assignLoading}
        onBack={handleBack}
        loadingAccessibilityLabel="Loading bill assignments"
      />
    );
  }

  if (isError) {
    return (
      <ScreenErrorState
        title={SCREEN_TITLES.assign}
        message={getApiErrorMessage(
          loadError,
          FEEDBACK_MESSAGES.assignLoadError,
        )}
        onBack={handleBack}
        actionLabel="Try again"
        onAction={() => {
          void refetchBill();
          void refetchSummary();
        }}
      />
    );
  }

  if (!billData || !summaryData || !apiAssignData) {
    return (
      <AssignEmptyState variant="no-assignment-data" onBack={handleBack} />
    );
  }

  if (lines.length === 0) {
    return (
      <AssignEmptyState
        variant="no-lines"
        merchantTopHint={merchantTopHint}
        onBack={handleBack}
        onReviewReceipt={() =>
          router.push({
            pathname: "/scan/review",
            params: { billId: String(billId) },
          })
        }
      />
    );
  }

  if (members.length === 0) {
    return (
      <AssignEmptyState
        variant="no-participants"
        merchantTopHint={merchantTopHint}
        onBack={handleBack}
        onAddPerson={handleAddMember}
      />
    );
  }

  const activeAssignMember =
    activeMemberId !== null ? (memberById.get(activeMemberId) ?? null) : null;

  const sheetLine =
    sheetLineId !== null
      ? (lines.find((line) => line.id === sheetLineId) ?? null)
      : null;

  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader
        className="pb-4"
        title={SCREEN_TITLES.assign}
        topHint={merchantTopHint}
        onBack={handleBack}
        rightSlot={
          <AssignOverflowMenu
            iconColor={colors.foreground}
            intensity={scheme === "dark" ? 24 : 18}
            tint={scheme === "dark" ? "dark" : "light"}
            onClearAssignments={bulkActions.handleClearAssignments}
            onManagePeople={handleManagePeople}
            onSplitAllEqually={bulkActions.handleSplitEqually}
            onSplitUnassignedItems={bulkActions.handleSplitUnassignedItems}
            showUndoSplitEqually={false}
          />
        }
      />

      <View className="flex-1 bg-stone-50 dark:bg-neutral-950/50">
        <AssignPeopleRow
          activeMemberId={activeMemberId}
          foregroundColor={colors.foreground}
          members={members}
          peopleSectionSubtitle="Select a person, then tap items to assign"
          peopleSectionTitle="Assign to"
          onAddMember={handleAddMember}
          onCloseSheet={() => setSheetLineId(null)}
          onSelectMember={setActiveMember}
        />

        <View className="flex-1">
          <AssignItemsList
            activeAssignMember={activeAssignMember}
            activeMemberId={activeMemberId}
            assignmentError={assignmentError}
            displayAssignments={displayAssignments}
            formatAmount={formatMoneyFromCents}
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
            isApiMode
            itemCountLabel={`${progress.assignedLineCount} of ${progress.assignmentLineTotal} items assigned`}
            mutedColor={colors.muted}
            onSummaryPress={handleSummary}
          />
        </View>
      </View>

      <AssignItemSheet
        key={sheetLineId ?? "_"}
        bottomInset={insets.bottom}
        formatAmount={formatMoneyFromCents}
        initialSelectedIds={
          sheetLineId ? [...(displayAssignments[sheetLineId] ?? [])] : []
        }
        line={sheetLine}
        members={members}
        visible={sheetLineId !== null}
        onClose={() => setSheetLineId(null)}
        onSave={(memberIds) => {
          if (sheetLineId === null) return;
          persistLineAssignments(sheetLineId, memberIds);
          setSheetLineId(null);
        }}
      />
    </ScreenContainer>
  );
};
