import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  billQueryKeys,
  clearReceiptItemAssignments,
  replaceReceiptItemAssignments,
} from "@/api/billApi";
import type { BillShowResponse } from "@/types/api";
import { applyOptimisticItemAssignments } from "@/utils/bill-to-assign";

export type ReplaceItemAssignmentsVariables = {
  receiptItemId: number;
  participantIds: number[];
};

type ReplaceItemAssignmentsContext = {
  previousBill: BillShowResponse | undefined;
};

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
      void queryClient.invalidateQueries({
        queryKey: billQueryKeys.detail(billId),
      });
      void queryClient.invalidateQueries({
        queryKey: billQueryKeys.summary(billId),
      });
    },
  });
}
