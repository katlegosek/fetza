import type { BillSummary, IsoDateTime } from "@/services/bills/bill.types";

export interface BillParticipant {
  id: number;
  bill_id: number;
  name: string;
  initials: string | null;
  avatar_background_color: string | null;
  avatar_text_color: string | null;
  seat_index: number | null;
  is_host: boolean;
  settled: boolean;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

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
