import type { BillSummary, IsoDateTime } from "@/services/bills/bill.types";

export type SplitMethod = "equal" | "custom";

export interface ItemAssignment {
  id: number;
  receipt_item_id: number;
  bill_participant_id: number;
  amount_cents: number;
  split_method: SplitMethod;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

export interface ReplaceAssignmentsInput {
  participant_ids: number[];
  split_method: "equal";
}

export interface BillSummaryMutationResponse {
  bill_summary: BillSummary;
}
