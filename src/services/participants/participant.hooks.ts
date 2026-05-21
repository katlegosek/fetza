import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateBillQueries } from "@/api/invalidate-bill-queries";
import { billQueryKeys } from "@/services/bills/bill.keys";
import type { BillSummary } from "@/services/bills/types";
import {
  createParticipant,
  deleteParticipant,
  updateParticipant,
} from "@/services/participants/participant.service";
import type {
  ParticipantDeleteResponse,
  ParticipantInput,
  ParticipantMutationResponse,
} from "@/services/participants/types";
import { applyOptimisticParticipantSettled } from "@/utils/bill-summary-settled";

type ParticipantMutationResponseLike = {
  bill_summary: BillSummary;
};

function useParticipantBillMutation<
  TVariables,
  TData extends ParticipantMutationResponseLike,
>(billId: number, mutationFn: (variables: TVariables) => Promise<TData>) {
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

export type CreateBillParticipantVariables = {
  participant: ParticipantInput;
};

export type UpdateBillParticipantVariables = {
  participantId: number;
  participant: Partial<ParticipantInput>;
};

export type ToggleParticipantSettledVariables = {
  participantId: number;
  settled: boolean;
};

type ToggleSettledContext = {
  previousSummary: BillSummary | undefined;
};

export function useBillParticipants(billId: number) {
  const queryClient = useQueryClient();

  const createParticipantMutation = useParticipantBillMutation<
    CreateBillParticipantVariables,
    ParticipantMutationResponse
  >(billId, ({ participant }) => createParticipant(billId, participant));

  const updateParticipantMutation = useParticipantBillMutation<
    UpdateBillParticipantVariables,
    ParticipantMutationResponse
  >(billId, ({ participantId, participant }) =>
    updateParticipant(participantId, participant),
  );

  const deleteParticipantMutation = useParticipantBillMutation<
    number,
    ParticipantDeleteResponse
  >(billId, (participantId) => deleteParticipant(participantId));

  const toggleParticipantSettledMutation = useMutation({
    mutationFn: ({
      participantId,
      settled,
    }: ToggleParticipantSettledVariables) =>
      updateParticipant(participantId, { settled }),
    onMutate: async ({ participantId, settled }) => {
      await queryClient.cancelQueries({
        queryKey: billQueryKeys.summary(billId),
      });

      const previousSummary = queryClient.getQueryData<BillSummary>(
        billQueryKeys.summary(billId),
      );

      if (previousSummary) {
        queryClient.setQueryData<BillSummary>(
          billQueryKeys.summary(billId),
          applyOptimisticParticipantSettled(
            previousSummary,
            participantId,
            settled,
          ),
        );
      }

      return { previousSummary } satisfies ToggleSettledContext;
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSummary) {
        queryClient.setQueryData(
          billQueryKeys.summary(billId),
          context.previousSummary,
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

  return {
    createParticipant: createParticipantMutation,
    updateParticipant: updateParticipantMutation,
    deleteParticipant: deleteParticipantMutation,
    toggleParticipantSettled: toggleParticipantSettledMutation,
  };
}

export type { ParticipantMutationResponse };
