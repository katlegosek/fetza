import type { BillShowResponse } from "@/services/bills/types";
import type {
  ReceiptAdjustment,
  ReceiptAdjustmentKind,
} from "@/services/receipts/types";
import type { DraftBill } from "@/types/draft-bill";

export type ReceiptFeeRow = {
  id: string;
  label: string;
  amountCents: number;
  kind: ReceiptAdjustmentKind;
  affectsTotal: boolean;
  position: number;
};

export type BillReceiptView = {
  draft: DraftBill;
  feeRows: ReceiptFeeRow[];
  subtotalCents: number;
  totalCents: number;
};

function formatReceiptTimestamp(
  receiptDate: string | null | undefined,
  createdAt: string,
): string {
  const raw = receiptDate ?? createdAt;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const datePart = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timePart = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart}  ${timePart}`;
}

function adjustmentRows(adjustments: ReceiptAdjustment[]): ReceiptFeeRow[] {
  return [...adjustments]
    .sort((a, b) => a.position - b.position)
    .filter((adjustment) => adjustment.kind !== "subtotal")
    .map((adjustment) => ({
      id: String(adjustment.id),
      label: adjustment.label,
      amountCents: adjustment.amount_cents,
      kind: adjustment.kind,
      affectsTotal: adjustment.affects_total,
      position: adjustment.position,
    }));
}

export function billShowToReceiptView(data: BillShowResponse): BillReceiptView {
  const { bill, receipt, receipt_items, receipt_adjustments } = data;

  const merchant =
    receipt?.merchant_name?.trim() || bill.receipt_name?.trim() || bill.title;

  const lines = [...receipt_items]
    .sort((a, b) => a.position - b.position)
    .map((item) => ({
      id: String(item.id),
      qty: item.quantity,
      description: item.name,
      amountCents: item.total_cents,
    }));

  const itemsSubtotalCents = lines.reduce(
    (sum, line) => sum + line.amountCents,
    0,
  );

  const feeRows = adjustmentRows(receipt_adjustments);

  const subtotalCents =
    receipt && receipt.subtotal_cents > 0
      ? receipt.subtotal_cents
      : itemsSubtotalCents;

  const totalCents =
    receipt && receipt.total_cents > 0 ? receipt.total_cents : bill.total_cents;

  const draft: DraftBill = {
    merchant,
    billId: `BILL-${bill.id}`,
    timestamp: formatReceiptTimestamp(
      receipt?.receipt_date ?? bill.receipt_date,
      bill.created_at,
    ),
    lines,
    vatCents: receipt?.tax_cents ?? 0,
    serviceFeeCents:
      (receipt?.service_fee_cents ?? 0) + (receipt?.tip_cents ?? 0),
  };

  return {
    draft,
    feeRows,
    subtotalCents,
    totalCents,
  };
}
