import { apiRequest } from "@/api/client";
import type {
  BillShowResponse,
  BillSummary,
  BillSummaryMutationResponse,
  BillsIndexResponse,
  ParticipantDeleteResponse,
  ParticipantInput,
  ParticipantMutationResponse,
  ReceiptAdjustmentDeleteResponse,
  ReceiptAdjustmentInput,
  ReceiptAdjustmentMutationResponse,
  ReceiptItemDeleteResponse,
  ReceiptItemInput,
  ReceiptItemMutationResponse,
  ReplaceAssignmentsInput,
} from "@/types/api";

export const billQueryKeys = {
  all: ["bills"] as const,
  lists: () => [...billQueryKeys.all, "list"] as const,
  list: () => billQueryKeys.lists(),
  details: () => [...billQueryKeys.all, "detail"] as const,
  detail: (billId: number) => [...billQueryKeys.details(), billId] as const,
  summaries: () => [...billQueryKeys.all, "summary"] as const,
  summary: (billId: number) => [...billQueryKeys.summaries(), billId] as const,
};

export function getBills(): Promise<BillsIndexResponse> {
  return apiRequest<BillsIndexResponse>("/bills");
}

export function getBill(billId: number): Promise<BillShowResponse> {
  return apiRequest<BillShowResponse>(`/bills/${billId}`);
}

export function getBillSummary(billId: number): Promise<BillSummary> {
  return apiRequest<BillSummary>(`/bills/${billId}/summary`);
}

export function createParticipant(
  billId: number,
  participant: ParticipantInput,
): Promise<ParticipantMutationResponse> {
  return apiRequest<ParticipantMutationResponse>(
    `/bills/${billId}/participants`,
    {
      method: "POST",
      body: { participant },
    },
  );
}

export function updateParticipant(
  participantId: number,
  participant: Partial<ParticipantInput>,
): Promise<ParticipantMutationResponse> {
  return apiRequest<ParticipantMutationResponse>(
    `/bill_participants/${participantId}`,
    {
      method: "PATCH",
      body: { participant },
    },
  );
}

export function deleteParticipant(
  participantId: number,
): Promise<ParticipantDeleteResponse> {
  return apiRequest<ParticipantDeleteResponse>(
    `/bill_participants/${participantId}`,
    {
      method: "DELETE",
    },
  );
}

export function createReceiptItem(
  billId: number,
  receiptItem: ReceiptItemInput,
): Promise<ReceiptItemMutationResponse> {
  return apiRequest<ReceiptItemMutationResponse>(
    `/bills/${billId}/receipt_items`,
    {
      method: "POST",
      body: { receipt_item: receiptItem },
    },
  );
}

export function updateReceiptItem(
  receiptItemId: number,
  receiptItem: Partial<ReceiptItemInput>,
): Promise<ReceiptItemMutationResponse> {
  return apiRequest<ReceiptItemMutationResponse>(
    `/receipt_items/${receiptItemId}`,
    {
      method: "PATCH",
      body: { receipt_item: receiptItem },
    },
  );
}

export function deleteReceiptItem(
  receiptItemId: number,
): Promise<ReceiptItemDeleteResponse> {
  return apiRequest<ReceiptItemDeleteResponse>(
    `/receipt_items/${receiptItemId}`,
    {
      method: "DELETE",
    },
  );
}

export function replaceReceiptItemAssignments(
  receiptItemId: number,
  input: ReplaceAssignmentsInput,
): Promise<ReceiptItemMutationResponse> {
  return apiRequest<ReceiptItemMutationResponse>(
    `/receipt_items/${receiptItemId}/assignments`,
    {
      method: "PUT",
      body: input,
    },
  );
}

export function clearReceiptItemAssignments(
  receiptItemId: number,
): Promise<ReceiptItemMutationResponse> {
  return apiRequest<ReceiptItemMutationResponse>(
    `/receipt_items/${receiptItemId}/assignments`,
    {
      method: "DELETE",
    },
  );
}

export function splitAllEqually(
  billId: number,
): Promise<BillSummaryMutationResponse> {
  return apiRequest<BillSummaryMutationResponse>(
    `/bills/${billId}/split_all_equally`,
    {
      method: "POST",
    },
  );
}

export function splitUnassignedEqually(
  billId: number,
): Promise<BillSummaryMutationResponse> {
  return apiRequest<BillSummaryMutationResponse>(
    `/bills/${billId}/split_unassigned_equally`,
    {
      method: "POST",
    },
  );
}

export function clearBillAssignments(
  billId: number,
): Promise<BillSummaryMutationResponse> {
  return apiRequest<BillSummaryMutationResponse>(
    `/bills/${billId}/assignments`,
    {
      method: "DELETE",
    },
  );
}

export function createReceiptAdjustment(
  receiptId: number,
  receiptAdjustment: ReceiptAdjustmentInput,
): Promise<ReceiptAdjustmentMutationResponse> {
  return apiRequest<ReceiptAdjustmentMutationResponse>(
    `/receipts/${receiptId}/adjustments`,
    {
      method: "POST",
      body: { receipt_adjustment: receiptAdjustment },
    },
  );
}

export function updateReceiptAdjustment(
  adjustmentId: number,
  receiptAdjustment: Partial<ReceiptAdjustmentInput>,
): Promise<ReceiptAdjustmentMutationResponse> {
  return apiRequest<ReceiptAdjustmentMutationResponse>(
    `/receipt_adjustments/${adjustmentId}`,
    {
      method: "PATCH",
      body: { receipt_adjustment: receiptAdjustment },
    },
  );
}

export function deleteReceiptAdjustment(
  adjustmentId: number,
): Promise<ReceiptAdjustmentDeleteResponse> {
  return apiRequest<ReceiptAdjustmentDeleteResponse>(
    `/receipt_adjustments/${adjustmentId}`,
    {
      method: "DELETE",
    },
  );
}
