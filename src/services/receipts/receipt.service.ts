import { apiMultipartRequest, apiRequest } from "@/api/client";
import { parseApiResponse } from "@/api/parse-api-response";
import { receiptEndpoints } from "@/services/receipts/receipt.endpoints";
import {
  ReceiptAdjustmentDeleteResponseSchema,
  ReceiptAdjustmentMutationResponseSchema,
  ReceiptImageUploadResponseSchema,
  ReceiptItemDeleteResponseSchema,
  ReceiptItemMutationResponseSchema,
  ReceiptShowResponseSchema,
} from "@/services/receipts/receipt.schema";
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
  const data = await apiRequest<unknown>(receiptEndpoints.receipt(receiptId));
  return parseApiResponse(ReceiptShowResponseSchema, data);
}

export async function uploadReceiptImage(
  billId: number,
  formData: FormData,
): Promise<ReceiptUploadResponse> {
  const data = await apiMultipartRequest<unknown>(
    receiptEndpoints.billReceiptImages(billId),
    { formData },
  );
  return parseApiResponse(ReceiptImageUploadResponseSchema, data);
}

export async function createReceiptItem(
  billId: number,
  receiptItem: ReceiptItemInput,
): Promise<ReceiptItemMutationResponse> {
  const data = await apiRequest<unknown>(
    receiptEndpoints.billReceiptItems(billId),
    {
      method: "POST",
      body: { receipt_item: receiptItem },
    },
  );
  return parseApiResponse(ReceiptItemMutationResponseSchema, data);
}

export async function updateReceiptItem(
  receiptItemId: number,
  receiptItem: Partial<ReceiptItemInput>,
): Promise<ReceiptItemMutationResponse> {
  const data = await apiRequest<unknown>(
    receiptEndpoints.receiptItem(receiptItemId),
    {
      method: "PATCH",
      body: { receipt_item: receiptItem },
    },
  );
  return parseApiResponse(ReceiptItemMutationResponseSchema, data);
}

export async function deleteReceiptItem(
  receiptItemId: number,
): Promise<ReceiptItemDeleteResponse> {
  const data = await apiRequest<unknown>(
    receiptEndpoints.receiptItem(receiptItemId),
    {
      method: "DELETE",
    },
  );
  return parseApiResponse(ReceiptItemDeleteResponseSchema, data);
}

export async function createReceiptAdjustment(
  receiptId: number,
  receiptAdjustment: ReceiptAdjustmentInput,
): Promise<ReceiptAdjustmentMutationResponse> {
  const data = await apiRequest<unknown>(
    receiptEndpoints.receiptAdjustments(receiptId),
    {
      method: "POST",
      body: { receipt_adjustment: receiptAdjustment },
    },
  );
  return parseApiResponse(ReceiptAdjustmentMutationResponseSchema, data);
}

export async function updateReceiptAdjustment(
  adjustmentId: number,
  receiptAdjustment: Partial<ReceiptAdjustmentInput>,
): Promise<ReceiptAdjustmentMutationResponse> {
  const data = await apiRequest<unknown>(
    receiptEndpoints.receiptAdjustment(adjustmentId),
    {
      method: "PATCH",
      body: { receipt_adjustment: receiptAdjustment },
    },
  );
  return parseApiResponse(ReceiptAdjustmentMutationResponseSchema, data);
}

export async function deleteReceiptAdjustment(
  adjustmentId: number,
): Promise<ReceiptAdjustmentDeleteResponse> {
  const data = await apiRequest<unknown>(
    receiptEndpoints.receiptAdjustment(adjustmentId),
    {
      method: "DELETE",
    },
  );
  return parseApiResponse(ReceiptAdjustmentDeleteResponseSchema, data);
}
