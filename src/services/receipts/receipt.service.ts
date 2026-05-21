import { apiMultipartRequest, apiRequest } from "@/api/client";
import { receiptEndpoints } from "@/services/receipts/receipt.endpoints";
import type {
  ReceiptAdjustmentDeleteResponse,
  ReceiptAdjustmentInput,
  ReceiptAdjustmentMutationResponse,
  ReceiptItemDeleteResponse,
  ReceiptItemInput,
  ReceiptItemMutationResponse,
  ReceiptShowResponse,
  ReceiptUploadResponse,
} from "@/services/receipts/receipt.types";

export async function getReceipt(
  receiptId: number,
): Promise<ReceiptShowResponse> {
  return apiRequest<ReceiptShowResponse>(receiptEndpoints.receipt(receiptId));
}

export async function uploadReceiptImage(
  billId: number,
  formData: FormData,
): Promise<ReceiptUploadResponse> {
  return apiMultipartRequest<ReceiptUploadResponse>(
    receiptEndpoints.billReceiptImages(billId),
    { formData },
  );
}

export async function createReceiptItem(
  billId: number,
  receiptItem: ReceiptItemInput,
): Promise<ReceiptItemMutationResponse> {
  return apiRequest<ReceiptItemMutationResponse>(
    receiptEndpoints.billReceiptItems(billId),
    {
      method: "POST",
      body: { receipt_item: receiptItem },
    },
  );
}

export async function updateReceiptItem(
  receiptItemId: number,
  receiptItem: Partial<ReceiptItemInput>,
): Promise<ReceiptItemMutationResponse> {
  return apiRequest<ReceiptItemMutationResponse>(
    receiptEndpoints.receiptItem(receiptItemId),
    {
      method: "PATCH",
      body: { receipt_item: receiptItem },
    },
  );
}

export async function deleteReceiptItem(
  receiptItemId: number,
): Promise<ReceiptItemDeleteResponse> {
  return apiRequest<ReceiptItemDeleteResponse>(
    receiptEndpoints.receiptItem(receiptItemId),
    {
      method: "DELETE",
    },
  );
}

export async function createReceiptAdjustment(
  receiptId: number,
  receiptAdjustment: ReceiptAdjustmentInput,
): Promise<ReceiptAdjustmentMutationResponse> {
  return apiRequest<ReceiptAdjustmentMutationResponse>(
    receiptEndpoints.receiptAdjustments(receiptId),
    {
      method: "POST",
      body: { receipt_adjustment: receiptAdjustment },
    },
  );
}

export async function updateReceiptAdjustment(
  adjustmentId: number,
  receiptAdjustment: Partial<ReceiptAdjustmentInput>,
): Promise<ReceiptAdjustmentMutationResponse> {
  return apiRequest<ReceiptAdjustmentMutationResponse>(
    receiptEndpoints.receiptAdjustment(adjustmentId),
    {
      method: "PATCH",
      body: { receipt_adjustment: receiptAdjustment },
    },
  );
}

export async function deleteReceiptAdjustment(
  adjustmentId: number,
): Promise<ReceiptAdjustmentDeleteResponse> {
  return apiRequest<ReceiptAdjustmentDeleteResponse>(
    receiptEndpoints.receiptAdjustment(adjustmentId),
    {
      method: "DELETE",
    },
  );
}
