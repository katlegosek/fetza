import type {
  ReceiptAdjustmentKind,
  ReceiptStatus,
} from "@/services/receipts/receipt.enums.schema";

export type {
  ProcessingRunStatus,
  Receipt,
  ReceiptAdjustment,
  ReceiptAdjustmentDeleteResponse,
  ReceiptAdjustmentKind,
  ReceiptAdjustmentMutationResponse,
  ReceiptImage,
  ReceiptItem,
  ReceiptItemDeleteResponse,
  ReceiptItemMutationResponse,
  ReceiptProcessingRun,
  ReceiptShowResponse,
  ReceiptStatus,
  ReceiptStatusPayload,
  ReceiptUploadResponse,
} from "@/services/receipts/receipt.schema";

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

export interface ReceiptAdjustmentInput {
  label: string;
  kind: ReceiptAdjustmentKind;
  amount_cents: number;
  affects_total?: boolean;
  position?: number;
}

export interface ManualReceiptInput {
  merchant_name: string;
  receipt_date: string;
  subtotal_cents: number;
  total_cents: number;
  currency?: string;
  tax_cents?: number;
  service_fee_cents?: number;
  tip_cents?: number;
  discount_cents?: number;
}
