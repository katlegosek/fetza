import { parseApiResponse } from "@/api/parse-api-response";
import {
  ParticipantDeleteResponseSchema,
  ParticipantMutationResponseSchema,
} from "@/services/participants/participant.schema";
import type {
  ParticipantDeleteResponse,
  ParticipantMutationResponse,
} from "@/services/participants/types";

export function parseParticipantMutationResponse(
  data: unknown,
): ParticipantMutationResponse {
  return parseApiResponse(ParticipantMutationResponseSchema, data);
}

export function parseParticipantDeleteResponse(
  data: unknown,
): ParticipantDeleteResponse {
  return parseApiResponse(ParticipantDeleteResponseSchema, data);
}
