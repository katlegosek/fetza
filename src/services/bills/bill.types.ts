import type { ItemAssignment } from "@/services/assignments/assignment.types";
import type { BillParticipant } from "@/services/participants/participant.types";
import type {
  Receipt,
  ReceiptAdjustment,
  ReceiptAdjustmentKind,
  ReceiptItem,
} from "@/services/receipts/receipt.types";

/** ISO 8601 timestamp string from the Rails API. */
export type IsoDateTime = string;

export type BillStatus = "draft" | "active" | "completed" | "archived";

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

export interface BillCreateResponse {
  bill: BillDetail;
}

export interface BillsIndexResponse {
  bills: BillIndexItem[];
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

export interface BillShowResponse {
  bill: BillDetail;
  receipt: Receipt | null;
  receipt_items: ReceiptItem[];
  receipt_adjustments: ReceiptAdjustment[];
  bill_participants: BillParticipant[];
  item_assignments: ItemAssignment[];
}
