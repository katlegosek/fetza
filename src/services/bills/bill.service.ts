import { apiRequest } from "@/api/client";
import { parseApiResponse } from "@/api/parse-api-response";
import { BillSummaryResponseSchema } from "@/services/bills/bill-summary.schema";
import { billEndpoints } from "@/services/bills/bill.endpoints";
import {
  BillListResponseSchema,
  BillShowResponseSchema,
} from "@/services/bills/bill.schema";
import type {
  BillCreateResponse,
  BillShowResponse,
  BillSummary,
  BillsIndexResponse,
} from "@/services/bills/bill.types";

export async function getBills(): Promise<BillsIndexResponse> {
  const data = await apiRequest<unknown>(billEndpoints.bills());
  return parseApiResponse(BillListResponseSchema, data);
}

export async function createBill(title?: string): Promise<BillCreateResponse> {
  return apiRequest<BillCreateResponse>(billEndpoints.bills(), {
    method: "POST",
    body: title ? { bill: { title } } : {},
  });
}

export async function getBill(billId: number): Promise<BillShowResponse> {
  const data = await apiRequest<unknown>(billEndpoints.bill(billId));
  return parseApiResponse(BillShowResponseSchema, data);
}

export async function getBillSummary(billId: number): Promise<BillSummary> {
  const data = await apiRequest<unknown>(billEndpoints.billSummary(billId));
  return parseApiResponse(BillSummaryResponseSchema, data);
}
