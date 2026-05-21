import { avatarTonesForPaletteIndex } from "@/lib/member-avatar-tones";
import type { ParticipantInput } from "@/services/participants/participant.types";
import { participantInitials } from "@/utils/participant";

export function buildParticipantInput(
  name: string,
  seatIndex: number,
): ParticipantInput {
  const trimmed = name.trim();
  const tones = avatarTonesForPaletteIndex(seatIndex);

  return {
    name: trimmed,
    initials: participantInitials(trimmed),
    avatar_background_color: tones.avatarBackgroundColor,
    avatar_text_color: tones.avatarTextColor,
    seat_index: seatIndex,
  };
}
