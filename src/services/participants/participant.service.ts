import { apiRequest } from "@/api/client";
import { parseApiResponse } from "@/api/parse-api-response";
import { participantEndpoints } from "@/services/participants/participant.endpoints";
import {
  ParticipantDeleteResponseSchema,
  ParticipantMutationResponseSchema,
} from "@/services/participants/participant.schema";
import type {
  ParticipantDeleteResponse,
  ParticipantInput,
  ParticipantMutationResponse,
} from "@/services/participants/participant.types";

export async function createParticipant(
  billId: number,
  participant: ParticipantInput,
): Promise<ParticipantMutationResponse> {
  const data = await apiRequest<unknown>(
    participantEndpoints.billParticipants(billId),
    {
      method: "POST",
      body: { participant },
    },
  );
  return parseApiResponse(ParticipantMutationResponseSchema, data);
}

export async function updateParticipant(
  participantId: number,
  participant: Partial<ParticipantInput>,
): Promise<ParticipantMutationResponse> {
  const data = await apiRequest<unknown>(
    participantEndpoints.participant(participantId),
    {
      method: "PATCH",
      body: { participant },
    },
  );
  return parseApiResponse(ParticipantMutationResponseSchema, data);
}

export async function deleteParticipant(
  participantId: number,
): Promise<ParticipantDeleteResponse> {
  const data = await apiRequest<unknown>(
    participantEndpoints.participant(participantId),
    {
      method: "DELETE",
    },
  );
  return parseApiResponse(ParticipantDeleteResponseSchema, data);
}
