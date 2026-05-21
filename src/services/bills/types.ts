import type { BillDetail } from "@/services/bills/bill.schema";

export type {
  BillDetail,
  BillIndexItem,
  BillShowResponse,
  BillStatus,
  BillSummary,
  BillSummaryAdjustment,
  BillSummaryBill,
  BillSummaryParticipant,
  BillSummaryTotals,
  BillsIndexResponse,
  IsoDateTime,
} from "@/services/bills/bill.schema";

export interface BillCreateResponse {
  bill: BillDetail;
}
