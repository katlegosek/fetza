import { apiRequest } from "@/api/client";
import {
  parseBillListResponse,
  parseBillShowResponse,
  parseBillSummaryResponse,
} from "@/services/bills/bill.model";
import billUrls from "@/services/bills/bill.urls";
import type {
  BillCreateResponse,
  BillShowResponse,
  BillSummary,
  BillsIndexResponse,
} from "@/services/bills/types";

const getBills = async (): Promise<BillsIndexResponse> => {
  const data = await apiRequest<unknown>(billUrls.bills());
  return parseBillListResponse(data);
};

const createBill = async (title?: string): Promise<BillCreateResponse> =>
  apiRequest<BillCreateResponse>(billUrls.bills(), {
    method: "POST",
    body: title ? { bill: { title } } : {},
  });

const getBill = async (billId: number): Promise<BillShowResponse> => {
  const data = await apiRequest<unknown>(billUrls.bill(billId));
  return parseBillShowResponse(data);
};

const getBillSummary = async (billId: number): Promise<BillSummary> => {
  const data = await apiRequest<unknown>(billUrls.billSummary(billId));
  return parseBillSummaryResponse(data);
};

export default {
  getBills,
  createBill,
  getBill,
  getBillSummary,
};
