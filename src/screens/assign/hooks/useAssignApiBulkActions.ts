import { useCallback } from "react";
import { Alert } from "react-native";

import { useBillBulkAssignments } from "@/hooks";

export type UseAssignApiBulkActionsOptions = {
  billId: number;
  setActiveMember: (memberId: string | null) => void;
  showAssignmentError: (error: unknown) => void;
};

export function useAssignApiBulkActions({
  billId,
  setActiveMember,
  showAssignmentError,
}: UseAssignApiBulkActionsOptions) {
  const bulkAssignments = useBillBulkAssignments(billId);

  const handleSplitEqually = useCallback(() => {
    bulkAssignments.splitAllEqually.mutate(undefined, {
      onError: showAssignmentError,
    });
  }, [bulkAssignments.splitAllEqually, showAssignmentError]);

  const handleSplitUnassignedItems = useCallback(() => {
    bulkAssignments.splitUnassignedEqually.mutate(undefined, {
      onError: showAssignmentError,
    });
  }, [bulkAssignments.splitUnassignedEqually, showAssignmentError]);

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
            bulkAssignments.clearBillAssignments.mutate(undefined, {
              onError: showAssignmentError,
              onSuccess: () => setActiveMember(null),
            });
          },
        },
      ],
    );
  }, [
    bulkAssignments.clearBillAssignments,
    setActiveMember,
    showAssignmentError,
  ]);

  return {
    handleClearAssignments,
    handleSplitEqually,
    handleSplitUnassignedItems,
  };
}
