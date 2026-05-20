import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  billQueryKeys,
  clearBillAssignments,
  splitAllEqually,
  splitUnassignedEqually,
} from "@/api/billApi";
import { invalidateBillQueries } from "@/api/invalidate-bill-queries";
import type { BillSummaryMutationResponse } from "@/types/api";

function useBillBulkAssignmentMutation(
  billId: number,
  mutationFn: () => Promise<BillSummaryMutationResponse>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (response) => {
      queryClient.setQueryData(
        billQueryKeys.summary(billId),
        response.bill_summary,
      );
    },
    onSettled: () => {
      void invalidateBillQueries(queryClient, billId);
    },
  });
}

export function useBillBulkAssignments(billId: number) {
  const splitAllEquallyMutation = useBillBulkAssignmentMutation(billId, () =>
    splitAllEqually(billId),
  );

  const splitUnassignedEquallyMutation = useBillBulkAssignmentMutation(
    billId,
    () => splitUnassignedEqually(billId),
  );

  const clearBillAssignmentsMutation = useBillBulkAssignmentMutation(
    billId,
    () => clearBillAssignments(billId),
  );

  return {
    splitAllEqually: splitAllEquallyMutation,
    splitUnassignedEqually: splitUnassignedEquallyMutation,
    clearBillAssignments: clearBillAssignmentsMutation,
  };
}
