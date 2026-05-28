import { parseApiResponse } from "@/api/parse-api-response";
import { BillSummaryResponseSchema } from "@/services/bills/bill-summary.schema";
import {
  BillCreateResponseSchema,
  BillListResponseSchema,
  BillShowResponseSchema,
} from "@/services/bills/bill.schema";
import type {
  BillCreateResponse,
  BillShowResponse,
  BillSummary,
  BillsIndexResponse,
} from "@/services/bills/types";

export const parseBillListResponse = (data: unknown): BillsIndexResponse =>
  parseApiResponse(BillListResponseSchema, data);

export const parseBillShowResponse = (data: unknown): BillShowResponse =>
  parseApiResponse(BillShowResponseSchema, data);

export const parseBillCreateResponse = (data: unknown): BillCreateResponse =>
  parseApiResponse(BillCreateResponseSchema, data);

export const parseBillSummaryResponse = (data: unknown): BillSummary =>
  parseApiResponse(BillSummaryResponseSchema, data);
