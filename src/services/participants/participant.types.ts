export type { BillParticipant } from "@/services/participants/participant.schema";

export type {
  ParticipantDeleteResponse,
  ParticipantMutationResponse,
} from "@/services/participants/participant.schema";

export interface ParticipantInput {
  name: string;
  initials?: string | null;
  avatar_background_color?: string | null;
  avatar_text_color?: string | null;
  seat_index?: number | null;
  is_host?: boolean;
  settled?: boolean;
}
