import type { ZodError } from "zod";
import { z } from "zod";

import { avatarTonesForPaletteIndex } from "@/lib/member-avatar-tones";
import type { ParticipantInput } from "@/services/participants/types";
import { participantInitials } from "@/utils/participant";

export const AssignParticipantSaveSchema = z.object({
  name: z.string().trim().min(1, "Enter a name."),
  initials: z
    .string()
    .trim()
    .max(3, "Initials must be at most 3 characters.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  avatar_background_color: z.string().optional(),
  avatar_text_color: z.string().optional(),
  seat_index: z.number().int().optional(),
  is_host: z.boolean().optional(),
});

export type AssignParticipantSave = z.infer<typeof AssignParticipantSaveSchema>;

function validationMessage(error: ZodError): string {
  const first = error.issues[0];
  if (first?.message) {
    return first.message;
  }
  return "Please check the form and try again.";
}

export function validateAssignParticipantSave(
  payload: { name: string } & Partial<Omit<AssignParticipantSave, "name">>,
): { ok: true; data: AssignParticipantSave } | { ok: false; message: string } {
  const result = AssignParticipantSaveSchema.safeParse(payload);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return { ok: false, message: validationMessage(result.error) };
}

export function participantInputFromAssignSave(
  save: AssignParticipantSave,
  seatIndex: number,
): ParticipantInput {
  const tones = avatarTonesForPaletteIndex(seatIndex);
  const initials = save.initials
    ? save.initials.toUpperCase()
    : participantInitials(save.name);

  return {
    name: save.name,
    initials,
    avatar_background_color:
      save.avatar_background_color ?? tones.avatarBackgroundColor,
    avatar_text_color: save.avatar_text_color ?? tones.avatarTextColor,
    seat_index: save.seat_index ?? seatIndex,
    ...(save.is_host !== undefined ? { is_host: save.is_host } : {}),
  };
}
