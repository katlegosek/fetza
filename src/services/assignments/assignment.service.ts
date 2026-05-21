import { apiRequest } from "@/api/client";
import { assignmentEndpoints } from "@/services/assignments/assignment.endpoints";
import type {
  BillSummaryMutationResponse,
  ReplaceAssignmentsInput,
} from "@/services/assignments/assignment.types";
import type { ReceiptItemMutationResponse } from "@/services/receipts/receipt.types";

export async function replaceReceiptItemAssignments(
  receiptItemId: number,
  input: ReplaceAssignmentsInput,
): Promise<ReceiptItemMutationResponse> {
  return apiRequest<ReceiptItemMutationResponse>(
    assignmentEndpoints.receiptItemAssignments(receiptItemId),
    {
      method: "PUT",
      body: input,
    },
  );
}

export async function clearReceiptItemAssignments(
  receiptItemId: number,
): Promise<ReceiptItemMutationResponse> {
  return apiRequest<ReceiptItemMutationResponse>(
    assignmentEndpoints.receiptItemAssignments(receiptItemId),
    {
      method: "DELETE",
    },
  );
}

export async function splitAllEqually(
  billId: number,
): Promise<BillSummaryMutationResponse> {
  return apiRequest<BillSummaryMutationResponse>(
    assignmentEndpoints.splitAllEqually(billId),
    {
      method: "POST",
    },
  );
}

export async function splitUnassignedEqually(
  billId: number,
): Promise<BillSummaryMutationResponse> {
  return apiRequest<BillSummaryMutationResponse>(
    assignmentEndpoints.splitUnassignedEqually(billId),
    {
      method: "POST",
    },
  );
}

export async function clearBillAssignments(
  billId: number,
): Promise<BillSummaryMutationResponse> {
  return apiRequest<BillSummaryMutationResponse>(
    assignmentEndpoints.billAssignments(billId),
    {
      method: "DELETE",
    },
  );
}
