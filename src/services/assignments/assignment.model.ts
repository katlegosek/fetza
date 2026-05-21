import { parseApiResponse } from "@/api/parse-api-response";
import { ItemAssignmentMutationResponseSchema } from "@/services/assignments/assignment.mutation.schema";
import { BulkAssignmentResponseSchema } from "@/services/assignments/assignment.schema";
import type {
  BulkAssignmentMutationResponse,
  ItemAssignmentMutationResponse,
} from "@/services/assignments/types";

export function parseItemAssignmentMutationResponse(
  data: unknown,
): ItemAssignmentMutationResponse {
  return parseApiResponse(ItemAssignmentMutationResponseSchema, data);
}

export function parseBulkAssignmentMutationResponse(
  data: unknown,
): BulkAssignmentMutationResponse {
  return parseApiResponse(BulkAssignmentResponseSchema, data);
}
