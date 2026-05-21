import { parseApiResponse } from "@/api/parse-api-response";
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
  ReceiptAdjustmentMutationResponse,
  ReceiptItemDeleteResponse,
  ReceiptItemMutationResponse,
  ReceiptShowResponse,
  ReceiptUploadResponse,
} from "@/services/receipts/types";

export function parseReceiptShowResponse(data: unknown): ReceiptShowResponse {
  return parseApiResponse(ReceiptShowResponseSchema, data);
}

export function parseReceiptUploadResponse(
  data: unknown,
): ReceiptUploadResponse {
  return parseApiResponse(ReceiptImageUploadResponseSchema, data);
}

export function parseReceiptItemMutationResponse(
  data: unknown,
): ReceiptItemMutationResponse {
  return parseApiResponse(ReceiptItemMutationResponseSchema, data);
}

export function parseReceiptItemDeleteResponse(
  data: unknown,
): ReceiptItemDeleteResponse {
  return parseApiResponse(ReceiptItemDeleteResponseSchema, data);
}

export function parseReceiptAdjustmentMutationResponse(
  data: unknown,
): ReceiptAdjustmentMutationResponse {
  return parseApiResponse(ReceiptAdjustmentMutationResponseSchema, data);
}

export function parseReceiptAdjustmentDeleteResponse(
  data: unknown,
): ReceiptAdjustmentDeleteResponse {
  return parseApiResponse(ReceiptAdjustmentDeleteResponseSchema, data);
}
