import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/api-error-message";
import {
  AssignItemSheet,
  AssignOverflowMenu,
  ScreenContainer,
  ScreenErrorState,
  ScreenHeader,
  ScreenLoadingState,
} from "@/components";
import {
  FEEDBACK_MESSAGES,
  SCREEN_TITLES,
} from "@/components/feedback/screen-feedback-copy";
import { useThemeColors } from "@/hooks";
import { AssignBottomBar } from "@/screens/assign/AssignBottomBar";
import { AssignEmptyState } from "@/screens/assign/AssignEmptyState";
import { AssignItemsList } from "@/screens/assign/AssignItemsList";
import { AssignPeopleRow } from "@/screens/assign/AssignPeopleRow";
import type { AssignMember } from "@/screens/assign/assign.constants";
import { assignOverflowMenuTop } from "@/screens/assign/assign.helpers";
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
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);

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

      <AssignOverflowMenu
        top={assignOverflowMenuTop(insets.top)}
        visible={overflowMenuOpen}
        onClearAssignments={bulkActions.handleClearAssignments}
        onClose={() => setOverflowMenuOpen(false)}
        onManagePeople={handleManagePeople}
        onSplitAllEqually={bulkActions.handleSplitEqually}
        onSplitUnassignedItems={bulkActions.handleSplitUnassignedItems}
        showUndoSplitEqually={false}
      />

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
