import networkService from "@/api/network-service";
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
  const data = await networkService.put<unknown, ReplaceAssignmentsInput>(
    assignmentUrls.receiptItemAssignments(receiptItemId),
    input,
  );
  return parseItemAssignmentMutationResponse(data);
};

const clearReceiptItemAssignments = async (
  receiptItemId: number,
): Promise<ItemAssignmentMutationResponse> => {
  const data = await networkService.delete<unknown>(
    assignmentUrls.receiptItemAssignments(receiptItemId),
  );
  return parseItemAssignmentMutationResponse(data);
};

const splitAllEqually = async (
  billId: number,
): Promise<BulkAssignmentMutationResponse> => {
  const data = await networkService.post<unknown>(
    assignmentUrls.splitAllEqually(billId),
  );
  return parseBulkAssignmentMutationResponse(data);
};

const splitUnassignedEqually = async (
  billId: number,
): Promise<BulkAssignmentMutationResponse> => {
  const data = await networkService.post<unknown>(
    assignmentUrls.splitUnassignedEqually(billId),
  );
  return parseBulkAssignmentMutationResponse(data);
};

const clearBillAssignments = async (
  billId: number,
): Promise<BulkAssignmentMutationResponse> => {
  const data = await networkService.delete<unknown>(
    assignmentUrls.billAssignments(billId),
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
