import { apiRequest } from "@/api/client";
import { billEndpoints } from "@/services/bills/bill.endpoints";
import type {
  BillCreateResponse,
  BillShowResponse,
  BillSummary,
  BillsIndexResponse,
} from "@/services/bills/bill.types";

export async function getBills(): Promise<BillsIndexResponse> {
  return apiRequest<BillsIndexResponse>(billEndpoints.bills());
}

export async function createBill(title?: string): Promise<BillCreateResponse> {
  return apiRequest<BillCreateResponse>(billEndpoints.bills(), {
    method: "POST",
    body: title ? { bill: { title } } : {},
  });
}

export async function getBill(billId: number): Promise<BillShowResponse> {
  return apiRequest<BillShowResponse>(billEndpoints.bill(billId));
}

export async function getBillSummary(billId: number): Promise<BillSummary> {
  return apiRequest<BillSummary>(billEndpoints.billSummary(billId));
}
