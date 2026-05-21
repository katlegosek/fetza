import { apiRequest } from "@/api/client";
import {
  parseBulkAssignmentMutationResponse,
  parseItemAssignmentMutationResponse,
} from "@/services/assignments/assignment.model";
import { assignmentUrls } from "@/services/assignments/assignment.urls";
import type {
  BulkAssignmentMutationResponse,
  ItemAssignmentMutationResponse,
  ReplaceAssignmentsInput,
} from "@/services/assignments/types";

export async function replaceReceiptItemAssignments(
  receiptItemId: number,
  input: ReplaceAssignmentsInput,
): Promise<ItemAssignmentMutationResponse> {
  const data = await apiRequest<unknown>(
    assignmentUrls.receiptItemAssignments(receiptItemId),
    {
      method: "PUT",
      body: input,
    },
  );
  return parseItemAssignmentMutationResponse(data);
}

export async function clearReceiptItemAssignments(
  receiptItemId: number,
): Promise<ItemAssignmentMutationResponse> {
  const data = await apiRequest<unknown>(
    assignmentUrls.receiptItemAssignments(receiptItemId),
    {
      method: "DELETE",
    },
  );
  return parseItemAssignmentMutationResponse(data);
}

export async function splitAllEqually(
  billId: number,
): Promise<BulkAssignmentMutationResponse> {
  const data = await apiRequest<unknown>(
    assignmentUrls.splitAllEqually(billId),
    {
      method: "POST",
    },
  );
  return parseBulkAssignmentMutationResponse(data);
}

export async function splitUnassignedEqually(
  billId: number,
): Promise<BulkAssignmentMutationResponse> {
  const data = await apiRequest<unknown>(
    assignmentUrls.splitUnassignedEqually(billId),
    {
      method: "POST",
    },
  );
  return parseBulkAssignmentMutationResponse(data);
}

export async function clearBillAssignments(
  billId: number,
): Promise<BulkAssignmentMutationResponse> {
  const data = await apiRequest<unknown>(
    assignmentUrls.billAssignments(billId),
    {
      method: "DELETE",
    },
  );
  return parseBulkAssignmentMutationResponse(data);
}
