import networkService from "@/api/network-service";
import {
  parseBillCreateResponse,
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

type CreateBillBody = { bill?: { title?: string } };

const getBills = async (): Promise<BillsIndexResponse> => {
  const data = await networkService.get<unknown>(billUrls.bills());
  return parseBillListResponse(data);
};

const createBill = async (title?: string): Promise<BillCreateResponse> => {
  const data = await networkService.post<unknown, CreateBillBody>(
    billUrls.bills(),
    title ? { bill: { title } } : {},
  );
  return parseBillCreateResponse(data);
};

const getBill = async (billId: number): Promise<BillShowResponse> => {
  const data = await networkService.get<unknown>(billUrls.bill(billId));
  return parseBillShowResponse(data);
};

const getBillSummary = async (billId: number): Promise<BillSummary> => {
  const data = await networkService.get<unknown>(billUrls.billSummary(billId));
  return parseBillSummaryResponse(data);
};

export default {
  getBills,
  createBill,
  getBill,
  getBillSummary,
};
