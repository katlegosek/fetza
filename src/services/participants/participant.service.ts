import networkService from "@/api/network-service";
import {
  parseParticipantDeleteResponse,
  parseParticipantMutationResponse,
} from "@/services/participants/participant.model";
import participantUrls from "@/services/participants/participant.urls";
import type {
  ParticipantDeleteResponse,
  ParticipantInput,
  ParticipantMutationResponse,
} from "@/services/participants/types";

type ParticipantRequestBody = {
  participant: ParticipantInput | Partial<ParticipantInput>;
};

const createParticipant = async (
  billId: number,
  participant: ParticipantInput,
): Promise<ParticipantMutationResponse> => {
  const data = await networkService.post<unknown, ParticipantRequestBody>(
    participantUrls.billParticipants(billId),
    { participant },
  );
  return parseParticipantMutationResponse(data);
};

const updateParticipant = async (
  participantId: number,
  participant: Partial<ParticipantInput>,
): Promise<ParticipantMutationResponse> => {
  const data = await networkService.patch<unknown, ParticipantRequestBody>(
    participantUrls.participant(participantId),
    { participant },
  );
  return parseParticipantMutationResponse(data);
};

const deleteParticipant = async (
  participantId: number,
): Promise<ParticipantDeleteResponse> => {
  const data = await networkService.delete<unknown>(
    participantUrls.participant(participantId),
  );
  return parseParticipantDeleteResponse(data);
};

export default {
  createParticipant,
  updateParticipant,
  deleteParticipant,
};
