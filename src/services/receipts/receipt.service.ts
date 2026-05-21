import { apiMultipartRequest, apiRequest } from "@/api/client";
import {
  parseReceiptAdjustmentDeleteResponse,
  parseReceiptAdjustmentMutationResponse,
  parseReceiptItemDeleteResponse,
  parseReceiptItemMutationResponse,
  parseReceiptShowResponse,
  parseReceiptUploadResponse,
} from "@/services/receipts/receipt.model";
import { receiptUrls } from "@/services/receipts/receipt.urls";
import type {
  ReceiptAdjustmentDeleteResponse,
  ReceiptAdjustmentInput,
  ReceiptAdjustmentMutationResponse,
  ReceiptItemDeleteResponse,
  ReceiptItemInput,
  ReceiptItemMutationResponse,
  ReceiptShowResponse,
  ReceiptUploadResponse,
} from "@/services/receipts/types";

export async function getReceipt(
  receiptId: number,
): Promise<ReceiptShowResponse> {
  const data = await apiRequest<unknown>(receiptUrls.receipt(receiptId));
  return parseReceiptShowResponse(data);
}

export async function uploadReceiptImage(
  billId: number,
  formData: FormData,
): Promise<ReceiptUploadResponse> {
  const data = await apiMultipartRequest<unknown>(
    receiptUrls.billReceiptImages(billId),
    { formData },
  );
  return parseReceiptUploadResponse(data);
}

export async function createReceiptItem(
  billId: number,
  receiptItem: ReceiptItemInput,
): Promise<ReceiptItemMutationResponse> {
  const data = await apiRequest<unknown>(receiptUrls.billReceiptItems(billId), {
    method: "POST",
    body: { receipt_item: receiptItem },
  });
  return parseReceiptItemMutationResponse(data);
}

export async function updateReceiptItem(
  receiptItemId: number,
  receiptItem: Partial<ReceiptItemInput>,
): Promise<ReceiptItemMutationResponse> {
  const data = await apiRequest<unknown>(
    receiptUrls.receiptItem(receiptItemId),
    {
      method: "PATCH",
      body: { receipt_item: receiptItem },
    },
  );
  return parseReceiptItemMutationResponse(data);
}

export async function deleteReceiptItem(
  receiptItemId: number,
): Promise<ReceiptItemDeleteResponse> {
  const data = await apiRequest<unknown>(
    receiptUrls.receiptItem(receiptItemId),
    {
      method: "DELETE",
    },
  );
  return parseReceiptItemDeleteResponse(data);
}

export async function createReceiptAdjustment(
  receiptId: number,
  receiptAdjustment: ReceiptAdjustmentInput,
): Promise<ReceiptAdjustmentMutationResponse> {
  const data = await apiRequest<unknown>(
    receiptUrls.receiptAdjustments(receiptId),
    {
      method: "POST",
      body: { receipt_adjustment: receiptAdjustment },
    },
  );
  return parseReceiptAdjustmentMutationResponse(data);
}

export async function updateReceiptAdjustment(
  adjustmentId: number,
  receiptAdjustment: Partial<ReceiptAdjustmentInput>,
): Promise<ReceiptAdjustmentMutationResponse> {
  const data = await apiRequest<unknown>(
    receiptUrls.receiptAdjustment(adjustmentId),
    {
      method: "PATCH",
      body: { receipt_adjustment: receiptAdjustment },
    },
  );
  return parseReceiptAdjustmentMutationResponse(data);
}

export async function deleteReceiptAdjustment(
  adjustmentId: number,
): Promise<ReceiptAdjustmentDeleteResponse> {
  const data = await apiRequest<unknown>(
    receiptUrls.receiptAdjustment(adjustmentId),
    {
      method: "DELETE",
    },
  );
  return parseReceiptAdjustmentDeleteResponse(data);
}
