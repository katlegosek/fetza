import type { BulkAssignmentMutationResponse } from "@/services/assignments/assignment.schema";

export type { ItemAssignmentMutationResponse } from "@/services/assignments/assignment.mutation.schema";
export type {
  BulkAssignmentMutationResponse,
  ItemAssignment,
  SplitMethod,
} from "@/services/assignments/assignment.schema";

export interface ReplaceAssignmentsInput {
  participant_ids: number[];
  split_method: "equal";
}

/** @deprecated Use BulkAssignmentMutationResponse */
export type BillSummaryMutationResponse = BulkAssignmentMutationResponse;
