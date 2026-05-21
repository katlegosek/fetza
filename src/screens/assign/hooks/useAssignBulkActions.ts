import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { Alert } from "react-native";

import type { DraftBill } from "@/mocks/review-draft.mock";
import type {
  AssignMember,
  Assignments,
} from "@/screens/assign/assign.constants";
import {
  cloneAssignments,
  isBillSplitEquallyAmongAll,
} from "@/screens/assign/assign.helpers";

export type UseAssignBulkActionsOptions = {
  draft: DraftBill | null;
  members: AssignMember[];
  assignments: Assignments;
  setAssignments: Dispatch<SetStateAction<Assignments>>;
  assignmentsBeforeSplitRef: MutableRefObject<Assignments | null>;
  resetAssignmentsBeforeSplit: () => void;
  snapshotAssignmentsBeforeSplit: (current: Assignments) => void;
  restoreAssignmentsBeforeSplit: () => void;
  setActiveMember: (memberId: string | null) => void;
};

export function useAssignBulkActions({
  draft,
  members,
  assignments,
  setAssignments,
  assignmentsBeforeSplitRef,
  resetAssignmentsBeforeSplit,
  snapshotAssignmentsBeforeSplit,
  restoreAssignmentsBeforeSplit,
  setActiveMember,
}: UseAssignBulkActionsOptions) {
  const fullEvenSplit = useMemo(
    () =>
      draft
        ? isBillSplitEquallyAmongAll(draft.lines, members, assignments)
        : false,
    [assignments, draft, members],
  );

  const canUndoSplitEqually =
    fullEvenSplit && assignmentsBeforeSplitRef.current !== null;

  const handleSplitEqually = useCallback(() => {
    if (!draft || members.length === 0) return;

    const allMemberIds = members.map((member) => member.id);
    setAssignments((previous) => {
      if (
        assignmentsBeforeSplitRef.current === null &&
        isBillSplitEquallyAmongAll(draft.lines, members, previous)
      ) {
        return previous;
      }
      snapshotAssignmentsBeforeSplit(previous);
      const next: Assignments = {};
      for (const line of draft.lines) {
        next[line.id] = [...allMemberIds];
      }
      return next;
    });
  }, [
    assignmentsBeforeSplitRef,
    draft,
    members,
    setAssignments,
    snapshotAssignmentsBeforeSplit,
  ]);

  const handleUndoSplitEqually = useCallback(() => {
    restoreAssignmentsBeforeSplit();
  }, [restoreAssignmentsBeforeSplit]);

  const handleSplitUnassignedItems = useCallback(() => {
    if (!draft || members.length === 0) return;

    const allMemberIds = members.map((member) => member.id);
    setAssignments((previous) => {
      const next = { ...previous };
      for (const line of draft.lines) {
        if ((next[line.id]?.length ?? 0) === 0) {
          next[line.id] = [...allMemberIds];
        }
      }
      return next;
    });
  }, [draft, members, setAssignments]);

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
            setAssignments({});
            resetAssignmentsBeforeSplit();
            setActiveMember(null);
          },
        },
      ],
    );
  }, [resetAssignmentsBeforeSplit, setActiveMember, setAssignments]);

  return {
    canUndoSplitEqually,
    handleClearAssignments,
    handleSplitEqually,
    handleSplitUnassignedItems,
    handleUndoSplitEqually,
  };
}
