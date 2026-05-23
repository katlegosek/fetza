import { apiRequest } from "@/api/client";
import {
  parseBulkAssignmentMutationResponse,
  parseItemAssignmentMutationResponse,
} from "@/services/assignments/assignment.model";
import assignmentUrls from "@/services/assignments/assignment.urls";
import type {
  BulkAssignmentMutationResponse,
  ItemAssignmentMutationResponse,
  ReplaceAssignmentsInput,
} from "@/services/assignments/types";

const replaceReceiptItemAssignments = async (
  receiptItemId: number,
  input: ReplaceAssignmentsInput,
): Promise<ItemAssignmentMutationResponse> => {
  const data = await apiRequest<unknown>(
    assignmentUrls.receiptItemAssignments(receiptItemId),
    {
      method: "PUT",
      body: input,
    },
  );
  return parseItemAssignmentMutationResponse(data);
};

const clearReceiptItemAssignments = async (
  receiptItemId: number,
): Promise<ItemAssignmentMutationResponse> => {
  const data = await apiRequest<unknown>(
    assignmentUrls.receiptItemAssignments(receiptItemId),
    {
      method: "DELETE",
    },
  );
  return parseItemAssignmentMutationResponse(data);
};

const splitAllEqually = async (
  billId: number,
): Promise<BulkAssignmentMutationResponse> => {
  const data = await apiRequest<unknown>(
    assignmentUrls.splitAllEqually(billId),
    {
      method: "POST",
    },
  );
  return parseBulkAssignmentMutationResponse(data);
};

const splitUnassignedEqually = async (
  billId: number,
): Promise<BulkAssignmentMutationResponse> => {
  const data = await apiRequest<unknown>(
    assignmentUrls.splitUnassignedEqually(billId),
    {
      method: "POST",
    },
  );
  return parseBulkAssignmentMutationResponse(data);
};

const clearBillAssignments = async (
  billId: number,
): Promise<BulkAssignmentMutationResponse> => {
  const data = await apiRequest<unknown>(
    assignmentUrls.billAssignments(billId),
    {
      method: "DELETE",
    },
  );
  return parseBulkAssignmentMutationResponse(data);
};

export default {
  replaceReceiptItemAssignments,
  clearReceiptItemAssignments,
  splitAllEqually,
  splitUnassignedEqually,
  clearBillAssignments,
};
