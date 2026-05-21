import { apiRequest } from "@/api/client";
import {
  parseParticipantDeleteResponse,
  parseParticipantMutationResponse,
} from "@/services/participants/participant.model";
import { participantUrls } from "@/services/participants/participant.urls";
import type {
  ParticipantDeleteResponse,
  ParticipantInput,
  ParticipantMutationResponse,
} from "@/services/participants/types";

export async function createParticipant(
  billId: number,
  participant: ParticipantInput,
): Promise<ParticipantMutationResponse> {
  const data = await apiRequest<unknown>(
    participantUrls.billParticipants(billId),
    {
      method: "POST",
      body: { participant },
    },
  );
  return parseParticipantMutationResponse(data);
}

export async function updateParticipant(
  participantId: number,
  participant: Partial<ParticipantInput>,
): Promise<ParticipantMutationResponse> {
  const data = await apiRequest<unknown>(
    participantUrls.participant(participantId),
    {
      method: "PATCH",
      body: { participant },
    },
  );
  return parseParticipantMutationResponse(data);
}

export async function deleteParticipant(
  participantId: number,
): Promise<ParticipantDeleteResponse> {
  const data = await apiRequest<unknown>(
    participantUrls.participant(participantId),
    {
      method: "DELETE",
    },
  );
  return parseParticipantDeleteResponse(data);
}
