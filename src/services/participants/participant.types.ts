import type { BillSummary } from "@/services/bills/bill.schema";
import type { BillParticipant } from "@/services/participants/participant.schema";

export type { BillParticipant } from "@/services/participants/participant.schema";

export interface ParticipantInput {
  name: string;
  initials?: string | null;
  avatar_background_color?: string | null;
  avatar_text_color?: string | null;
  seat_index?: number | null;
  is_host?: boolean;
  settled?: boolean;
}

export interface ParticipantMutationResponse {
  participant: BillParticipant;
  bill_summary: BillSummary;
}

export interface ParticipantDeleteResponse {
  participant: BillParticipant;
  bill_summary: BillSummary;
}
