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

export const parseReceiptShowResponse = (data: unknown): ReceiptShowResponse =>
  parseApiResponse(ReceiptShowResponseSchema, data);

export const parseReceiptUploadResponse = (
  data: unknown,
): ReceiptUploadResponse =>
  parseApiResponse(ReceiptImageUploadResponseSchema, data);

export const parseReceiptItemMutationResponse = (
  data: unknown,
): ReceiptItemMutationResponse =>
  parseApiResponse(ReceiptItemMutationResponseSchema, data);

export const parseReceiptItemDeleteResponse = (
  data: unknown,
): ReceiptItemDeleteResponse =>
  parseApiResponse(ReceiptItemDeleteResponseSchema, data);

export const parseReceiptAdjustmentMutationResponse = (
  data: unknown,
): ReceiptAdjustmentMutationResponse =>
  parseApiResponse(ReceiptAdjustmentMutationResponseSchema, data);

export const parseReceiptAdjustmentDeleteResponse = (
  data: unknown,
): ReceiptAdjustmentDeleteResponse =>
  parseApiResponse(ReceiptAdjustmentDeleteResponseSchema, data);
