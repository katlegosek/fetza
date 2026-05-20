/** ISO 8601 timestamp string from the Rails API. */
export type IsoDateTime = string;

export type ApiErrorCode =
  | "validation_error"
  | "not_found"
  | "bad_request"
  | "server_error"
  | "processing_failed"
  | "network_error";

export interface ApiErrorPayload {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  error: ApiErrorPayload;
}

export type BillStatus = "draft" | "active" | "completed" | "archived";

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

export type SplitMethod = "equal" | "custom";

export interface BillIndexItem {
  id: number;
  title: string;
  status: BillStatus;
  total_cents: number;
  participants_count: number;
  receipt_name: string;
  receipt_date: string | null;
  created_at: IsoDateTime;
}

export interface BillDetail {
  id: number;
  title: string;
  status: BillStatus;
  total_cents: number;
  receipt_name: string;
  receipt_date: string | null;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
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

export interface BillParticipant {
  id: number;
  bill_id: number;
  name: string;
  initials: string | null;
  avatar_background_color: string | null;
  avatar_text_color: string | null;
  seat_index: number | null;
  is_host: boolean;
  settled: boolean;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

export interface ItemAssignment {
  id: number;
  receipt_item_id: number;
  bill_participant_id: number;
  amount_cents: number;
  split_method: SplitMethod;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

export interface BillSummaryBill {
  id: number;
  title: string;
  status: BillStatus;
  total_cents: number;
  items_count: number;
  assigned_items_count: number;
  unassigned_items_count: number;
}

export interface BillSummaryTotals {
  bill_total_cents: number;
  assigned_total_cents: number;
  unassigned_total_cents: number;
  settled_total_cents: number;
  outstanding_total_cents: number;
}

export interface BillSummaryParticipant {
  id: number;
  name: string;
  initials: string | null;
  avatar_background_color: string | null;
  avatar_text_color: string | null;
  seat_index: number | null;
  is_host: boolean;
  settled: boolean;
  amount_due_cents: number;
  assigned_items_count: number;
}

export interface BillSummaryAdjustment {
  id: number;
  label: string;
  kind: ReceiptAdjustmentKind;
  amount_cents: number;
  affects_total: boolean;
  position: number;
}

export interface BillSummary {
  bill: BillSummaryBill;
  totals: BillSummaryTotals;
  participants: BillSummaryParticipant[];
  receipt_adjustments: BillSummaryAdjustment[];
}

export interface BillsIndexResponse {
  bills: BillIndexItem[];
}

export interface BillShowResponse {
  bill: BillDetail;
  receipt: Receipt | null;
  receipt_items: ReceiptItem[];
  receipt_adjustments: ReceiptAdjustment[];
  bill_participants: BillParticipant[];
  item_assignments: ItemAssignment[];
}

export interface ParticipantMutationResponse {
  participant: BillParticipant;
  bill_summary: BillSummary;
}

export interface ParticipantDeleteResponse {
  participant: BillParticipant;
  bill_summary: BillSummary;
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

export interface BillSummaryMutationResponse {
  bill_summary: BillSummary;
}

export interface ParticipantInput {
  name: string;
  initials?: string | null;
  avatar_background_color?: string | null;
  avatar_text_color?: string | null;
  seat_index?: number | null;
  is_host?: boolean;
  settled?: boolean;
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

export interface ReplaceAssignmentsInput {
  participant_ids: number[];
  split_method: "equal";
}
