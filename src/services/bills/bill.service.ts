import { apiRequest } from "@/api/client";
import {
  parseBillListResponse,
  parseBillShowResponse,
  parseBillSummaryResponse,
} from "@/services/bills/bill.model";
import { billUrls } from "@/services/bills/bill.urls";
import type {
  BillCreateResponse,
  BillShowResponse,
  BillSummary,
  BillsIndexResponse,
} from "@/services/bills/types";

export async function getBills(): Promise<BillsIndexResponse> {
  const data = await apiRequest<unknown>(billUrls.bills());
  return parseBillListResponse(data);
}

export async function createBill(title?: string): Promise<BillCreateResponse> {
  return apiRequest<BillCreateResponse>(billUrls.bills(), {
    method: "POST",
    body: title ? { bill: { title } } : {},
  });
}

export async function getBill(billId: number): Promise<BillShowResponse> {
  const data = await apiRequest<unknown>(billUrls.bill(billId));
  return parseBillShowResponse(data);
}

export async function getBillSummary(billId: number): Promise<BillSummary> {
  const data = await apiRequest<unknown>(billUrls.billSummary(billId));
  return parseBillSummaryResponse(data);
}
