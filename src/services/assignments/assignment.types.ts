import type { BillSummary } from "@/services/bills/bill.schema";

export type {
  ItemAssignment,
  SplitMethod,
} from "@/services/assignments/assignment.schema";

export interface ReplaceAssignmentsInput {
  participant_ids: number[];
  split_method: "equal";
}

export interface BillSummaryMutationResponse {
  bill_summary: BillSummary;
}
