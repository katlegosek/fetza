import type { BillSummary, IsoDateTime } from "@/services/bills/bill.types";

export type ReceiptStatus =
  | "draft"
  | "processing"
  | "ready"
  | "failed"
  | "confirmed";

export type ReceiptAdjustmentKind =
  | "subtotal"
  | "tax"
  | "service_fee"
  | "tip"
  | "discount"
  | "rounding"
  | "delivery_fee"
  | "other";

export type ProcessingRunStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface ReceiptStatusPayload {
  id: number;
  status: ReceiptStatus;
}

export interface ReceiptProcessingRun {
  id: number;
  receipt_id: number;
  provider: string;
  status: ProcessingRunStatus;
  error_message: string | null;
  started_at: IsoDateTime | null;
  completed_at: IsoDateTime | null;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

export interface ReceiptImage {
  id: number;
  receipt_id: number;
  position: number;
  capture_type: string;
  image_url: string | null;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

export interface ReceiptUploadResponse {
  receipt: ReceiptStatusPayload;
  receipt_image: ReceiptImage;
  processing_run: ReceiptProcessingRun;
}

export interface Receipt {
  id: number;
  bill_id: number;
  status: ReceiptStatus;
  merchant_name: string | null;
  receipt_date: string | null;
  subtotal_cents: number;
  total_cents: number;
  currency: string;
  tax_cents: number;
  service_fee_cents: number;
  tip_cents: number;
  discount_cents: number;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

export interface ReceiptItem {
  id: number;
  bill_id: number;
  receipt_id: number | null;
  name: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  category: string | null;
  icon_key: string | null;
  position: number;
  confidence: number | null;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

export interface ReceiptAdjustment {
  id: number;
  receipt_id: number;
  label: string;
  kind: ReceiptAdjustmentKind;
  amount_cents: number;
  affects_total: boolean;
  position: number;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

export interface ReceiptShowResponse {
  receipt: Receipt;
  processing_run: ReceiptProcessingRun | null;
  receipt_items?: ReceiptItem[];
  receipt_adjustments?: ReceiptAdjustment[];
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
