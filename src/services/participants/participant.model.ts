import { parseApiResponse } from "@/api/parse-api-response";
import {
  ParticipantDeleteResponseSchema,
  ParticipantMutationResponseSchema,
} from "@/services/participants/participant.schema";
import type {
  ParticipantDeleteResponse,
  ParticipantMutationResponse,
} from "@/services/participants/types";

export const parseParticipantMutationResponse = (
  data: unknown,
): ParticipantMutationResponse =>
  parseApiResponse(ParticipantMutationResponseSchema, data);

export const parseParticipantDeleteResponse = (
  data: unknown,
): ParticipantDeleteResponse =>
  parseApiResponse(ParticipantDeleteResponseSchema, data);
