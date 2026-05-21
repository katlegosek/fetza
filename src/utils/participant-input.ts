import {
  participantInputFromAssignSave,
  validateAssignParticipantSave,
} from "@/screens/assign/assign.schema";
import type { ParticipantInput } from "@/services/participants/participant.types";

/** @deprecated Prefer validateAssignParticipantSave + participantInputFromAssignSave */
export function buildParticipantInput(
  name: string,
  seatIndex: number,
): ParticipantInput {
  const validation = validateAssignParticipantSave({ name });
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  return participantInputFromAssignSave(validation.data, seatIndex);
}
