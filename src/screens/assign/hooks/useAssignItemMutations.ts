import { type Dispatch, type SetStateAction, useCallback } from "react";

import { useReplaceItemAssignments } from "@/hooks";
import type { Assignments } from "@/screens/assign/assign.constants";

export type UseAssignItemMutationsOptions = {
  billId: number;
  isApiMode: boolean;
  displayAssignments: Assignments;
  setAssignments?: Dispatch<SetStateAction<Assignments>>;
  showAssignmentError: (error: unknown) => void;
};

export function useAssignItemMutations({
  billId,
  isApiMode,
  displayAssignments,
  setAssignments,
  showAssignmentError,
}: UseAssignItemMutationsOptions) {
  const replaceItemAssignments = useReplaceItemAssignments(billId);

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

      setAssignments?.((previous) => ({ ...previous, [lineId]: nextIds }));
    },
    [displayAssignments, isApiMode, persistLineAssignments, setAssignments],
  );

  return {
    persistLineAssignments,
    toggleAssignment,
  };
}
