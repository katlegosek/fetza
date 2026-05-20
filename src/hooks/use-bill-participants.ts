import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  billQueryKeys,
  createParticipant,
  deleteParticipant,
  updateParticipant,
} from "@/api/billApi";
import { invalidateBillQueries } from "@/api/invalidate-bill-queries";
import type {
  BillSummary,
  ParticipantDeleteResponse,
  ParticipantInput,
  ParticipantMutationResponse,
} from "@/types/api";

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

export function useBillParticipants(billId: number) {
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

  return {
    createParticipant: createParticipantMutation,
    updateParticipant: updateParticipantMutation,
    deleteParticipant: deleteParticipantMutation,
  };
}

export type { ParticipantMutationResponse };
