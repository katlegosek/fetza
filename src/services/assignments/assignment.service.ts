import { apiRequest } from "@/api/client";
import { parseApiResponse } from "@/api/parse-api-response";
import { assignmentEndpoints } from "@/services/assignments/assignment.endpoints";
import { ItemAssignmentMutationResponseSchema } from "@/services/assignments/assignment.mutation.schema";
import { BulkAssignmentResponseSchema } from "@/services/assignments/assignment.schema";
import type {
  BulkAssignmentMutationResponse,
  ItemAssignmentMutationResponse,
  ReplaceAssignmentsInput,
} from "@/services/assignments/assignment.types";

export async function replaceReceiptItemAssignments(
  receiptItemId: number,
  input: ReplaceAssignmentsInput,
): Promise<ItemAssignmentMutationResponse> {
  const data = await apiRequest<unknown>(
    assignmentEndpoints.receiptItemAssignments(receiptItemId),
    {
      method: "PUT",
      body: input,
    },
  );
  return parseApiResponse(ItemAssignmentMutationResponseSchema, data);
}

export async function clearReceiptItemAssignments(
  receiptItemId: number,
): Promise<ItemAssignmentMutationResponse> {
  const data = await apiRequest<unknown>(
    assignmentEndpoints.receiptItemAssignments(receiptItemId),
    {
      method: "DELETE",
    },
  );
  return parseApiResponse(ItemAssignmentMutationResponseSchema, data);
}

export async function splitAllEqually(
  billId: number,
): Promise<BulkAssignmentMutationResponse> {
  const data = await apiRequest<unknown>(
    assignmentEndpoints.splitAllEqually(billId),
    {
      method: "POST",
    },
  );
  return parseApiResponse(BulkAssignmentResponseSchema, data);
}

export async function splitUnassignedEqually(
  billId: number,
): Promise<BulkAssignmentMutationResponse> {
  const data = await apiRequest<unknown>(
    assignmentEndpoints.splitUnassignedEqually(billId),
    {
      method: "POST",
    },
  );
  return parseApiResponse(BulkAssignmentResponseSchema, data);
}

export async function clearBillAssignments(
  billId: number,
): Promise<BulkAssignmentMutationResponse> {
  const data = await apiRequest<unknown>(
    assignmentEndpoints.billAssignments(billId),
    {
      method: "DELETE",
    },
  );
  return parseApiResponse(BulkAssignmentResponseSchema, data);
}
