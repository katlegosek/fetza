import networkService from "@/api/network-service";
import {
  parseReceiptAdjustmentDeleteResponse,
  parseReceiptAdjustmentMutationResponse,
  parseReceiptItemDeleteResponse,
  parseReceiptItemMutationResponse,
  parseReceiptShowResponse,
  parseReceiptUploadResponse,
} from "@/services/receipts/receipt.model";
import receiptUrls from "@/services/receipts/receipt.urls";
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

const getReceipt = async (receiptId: number): Promise<ReceiptShowResponse> => {
  const data = await networkService.get<unknown>(
    receiptUrls.receipt(receiptId),
  );
  return parseReceiptShowResponse(data);
};

const uploadReceiptImage = async (
  billId: number,
  formData: FormData,
): Promise<ReceiptUploadResponse> => {
  const data = await networkService.upload<unknown>(
    receiptUrls.billReceiptImages(billId),
    formData,
  );
  return parseReceiptUploadResponse(data);
};

const createReceiptItem = async (
  billId: number,
  receiptItem: ReceiptItemInput,
): Promise<ReceiptItemMutationResponse> => {
  const data = await networkService.post<unknown>(
    receiptUrls.billReceiptItems(billId),
    { receipt_item: receiptItem },
  );
  return parseReceiptItemMutationResponse(data);
};

const updateReceiptItem = async (
  receiptItemId: number,
  receiptItem: Partial<ReceiptItemInput>,
): Promise<ReceiptItemMutationResponse> => {
  const data = await networkService.patch<unknown>(
    receiptUrls.receiptItem(receiptItemId),
    { receipt_item: receiptItem },
  );
  return parseReceiptItemMutationResponse(data);
};

const deleteReceiptItem = async (
  receiptItemId: number,
): Promise<ReceiptItemDeleteResponse> => {
  const data = await networkService.delete<unknown>(
    receiptUrls.receiptItem(receiptItemId),
  );
  return parseReceiptItemDeleteResponse(data);
};

const createReceiptAdjustment = async (
  receiptId: number,
  receiptAdjustment: ReceiptAdjustmentInput,
): Promise<ReceiptAdjustmentMutationResponse> => {
  const data = await networkService.post<unknown>(
    receiptUrls.receiptAdjustments(receiptId),
    { receipt_adjustment: receiptAdjustment },
  );
  return parseReceiptAdjustmentMutationResponse(data);
};

const updateReceiptAdjustment = async (
  adjustmentId: number,
  receiptAdjustment: Partial<ReceiptAdjustmentInput>,
): Promise<ReceiptAdjustmentMutationResponse> => {
  const data = await networkService.patch<unknown>(
    receiptUrls.receiptAdjustment(adjustmentId),
    { receipt_adjustment: receiptAdjustment },
  );
  return parseReceiptAdjustmentMutationResponse(data);
};

const deleteReceiptAdjustment = async (
  adjustmentId: number,
): Promise<ReceiptAdjustmentDeleteResponse> => {
  const data = await networkService.delete<unknown>(
    receiptUrls.receiptAdjustment(adjustmentId),
  );
  return parseReceiptAdjustmentDeleteResponse(data);
};

export default {
  getReceipt,
  uploadReceiptImage,
  createReceiptItem,
  updateReceiptItem,
  deleteReceiptItem,
  createReceiptAdjustment,
  updateReceiptAdjustment,
  deleteReceiptAdjustment,
};
