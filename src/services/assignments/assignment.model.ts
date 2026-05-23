import { parseApiResponse } from "@/api/parse-api-response";
import { ItemAssignmentMutationResponseSchema } from "@/services/assignments/assignment.mutation.schema";
import { BulkAssignmentResponseSchema } from "@/services/assignments/assignment.schema";
import type {
  BulkAssignmentMutationResponse,
  ItemAssignmentMutationResponse,
} from "@/services/assignments/types";

export const parseItemAssignmentMutationResponse = (
  data: unknown,
): ItemAssignmentMutationResponse =>
  parseApiResponse(ItemAssignmentMutationResponseSchema, data);

export const parseBulkAssignmentMutationResponse = (
  data: unknown,
): BulkAssignmentMutationResponse =>
  parseApiResponse(BulkAssignmentResponseSchema, data);
