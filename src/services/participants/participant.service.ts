import { apiRequest } from "@/api/client";
import { participantEndpoints } from "@/services/participants/participant.endpoints";
import type {
  ParticipantDeleteResponse,
  ParticipantInput,
  ParticipantMutationResponse,
} from "@/services/participants/participant.types";

export async function createParticipant(
  billId: number,
  participant: ParticipantInput,
): Promise<ParticipantMutationResponse> {
  return apiRequest<ParticipantMutationResponse>(
    participantEndpoints.billParticipants(billId),
    {
      method: "POST",
      body: { participant },
    },
  );
}

export async function updateParticipant(
  participantId: number,
  participant: Partial<ParticipantInput>,
): Promise<ParticipantMutationResponse> {
  return apiRequest<ParticipantMutationResponse>(
    participantEndpoints.participant(participantId),
    {
      method: "PATCH",
      body: { participant },
    },
  );
}

export async function deleteParticipant(
  participantId: number,
): Promise<ParticipantDeleteResponse> {
  return apiRequest<ParticipantDeleteResponse>(
    participantEndpoints.participant(participantId),
    {
      method: "DELETE",
    },
  );
}
