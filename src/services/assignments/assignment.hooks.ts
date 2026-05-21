import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateBillQueries } from "@/api/invalidate-bill-queries";
import { applyOptimisticItemAssignments } from "@/screens/assign/mappers/bill-to-assign";
import {
  clearBillAssignments,
  clearReceiptItemAssignments,
  replaceReceiptItemAssignments,
  splitAllEqually,
  splitUnassignedEqually,
} from "@/services/assignments/assignment.service";
import type { BillSummaryMutationResponse } from "@/services/assignments/assignment.types";
import { billQueryKeys } from "@/services/bills/bill.keys";
import type { BillShowResponse } from "@/services/bills/bill.types";

export type ReplaceItemAssignmentsVariables = {
  receiptItemId: number;
  participantIds: number[];
};

type ReplaceItemAssignmentsContext = {
  previousBill: BillShowResponse | undefined;
};

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

export function useReplaceItemAssignments(billId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      receiptItemId,
      participantIds,
    }: ReplaceItemAssignmentsVariables) => {
      if (participantIds.length === 0) {
        return clearReceiptItemAssignments(receiptItemId);
      }

      return replaceReceiptItemAssignments(receiptItemId, {
        participant_ids: participantIds,
        split_method: "equal",
      });
    },
    onMutate: async ({ receiptItemId, participantIds }) => {
      await queryClient.cancelQueries({
        queryKey: billQueryKeys.detail(billId),
      });

      const previousBill = queryClient.getQueryData<BillShowResponse>(
        billQueryKeys.detail(billId),
      );

      if (previousBill) {
        queryClient.setQueryData<BillShowResponse>(
          billQueryKeys.detail(billId),
          applyOptimisticItemAssignments(
            previousBill,
            receiptItemId,
            participantIds,
          ),
        );
      }

      return { previousBill } satisfies ReplaceItemAssignmentsContext;
    },
    onError: (_error, _variables, context) => {
      if (context?.previousBill) {
        queryClient.setQueryData(
          billQueryKeys.detail(billId),
          context.previousBill,
        );
      }
    },
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
