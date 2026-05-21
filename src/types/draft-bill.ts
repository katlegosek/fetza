/** Receipt line shape used by thermal receipt UI and API view mappers. */
export type ReceiptLine = {
  id: string;
  qty: number;
  description: string;
  amountCents: number;
};

/** Bill receipt view model for thermal receipt and assign progress helpers. */
export type DraftBill = {
  merchant: string;
  billId: string;
  timestamp: string;
  lines: ReceiptLine[];
  /** VAT / tax amount included (use 0 when the slip has none). */
  vatCents: number;
  /** Mandatory service charge / levy (use 0 when none). */
  serviceFeeCents: number;
};
