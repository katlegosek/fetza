import type { BillSummary } from "@/services/bills/bill.schema";
import type {
  Receipt,
  ReceiptAdjustment,
  ReceiptAdjustmentKind,
  ReceiptImage,
  ReceiptItem,
  ReceiptProcessingRun,
  ReceiptStatus,
} from "@/services/receipts/receipt.schema";

export type {
  ProcessingRunStatus,
  Receipt,
  ReceiptAdjustment,
  ReceiptAdjustmentKind,
  ReceiptImage,
  ReceiptItem,
  ReceiptProcessingRun,
  ReceiptShowResponse,
  ReceiptStatus,
} from "@/services/receipts/receipt.schema";

export interface ReceiptStatusPayload {
  id: number;
  status: ReceiptStatus;
}

export interface ReceiptUploadResponse {
  receipt: ReceiptStatusPayload;
  receipt_image: ReceiptImage;
  processing_run: ReceiptProcessingRun;
}

export interface ReceiptItemInput {
  name: string;
  quantity?: number;
  unit_price_cents?: number;
  total_cents?: number;
  category?: string | null;
  icon_key?: string | null;
  position?: number;
  confidence?: number | null;
}

export interface ReceiptItemMutationResponse {
  receipt_item: ReceiptItem;
  bill_summary: BillSummary;
}

export interface ReceiptItemDeleteResponse {
  receipt_item: ReceiptItem;
  bill_summary: BillSummary;
}

export interface ReceiptAdjustmentInput {
  label: string;
  kind: ReceiptAdjustmentKind;
  amount_cents: number;
  affects_total?: boolean;
  position?: number;
}

export interface ReceiptAdjustmentMutationResponse {
  receipt_adjustment: ReceiptAdjustment;
  bill_summary: BillSummary;
}

export interface ReceiptAdjustmentDeleteResponse {
  receipt_adjustment: ReceiptAdjustment;
  bill_summary: BillSummary;
}
