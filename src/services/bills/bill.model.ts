import { parseApiResponse } from "@/api/parse-api-response";
import { BillSummaryResponseSchema } from "@/services/bills/bill-summary.schema";
import {
  BillListResponseSchema,
  BillShowResponseSchema,
} from "@/services/bills/bill.schema";
import type {
  BillShowResponse,
  BillSummary,
  BillsIndexResponse,
} from "@/services/bills/types";

export function parseBillListResponse(data: unknown): BillsIndexResponse {
  return parseApiResponse(BillListResponseSchema, data);
}

export function parseBillShowResponse(data: unknown): BillShowResponse {
  return parseApiResponse(BillShowResponseSchema, data);
}

export function parseBillSummaryResponse(data: unknown): BillSummary {
  return parseApiResponse(BillSummaryResponseSchema, data);
}
