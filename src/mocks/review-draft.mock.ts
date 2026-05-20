// TODO(production): Remove mock draft — use API bill/receipt types only. See docs/DEV_ONLY_TODOS.md
/** Bill types + seed payload for the scan → review flow (sample / dev data). */

export type ReceiptLine = {
  id: string;
  qty: number;
  description: string;
  amountCents: number;
};

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

export const MOCK_DRAFT_BILL: DraftBill = {
  merchant: "Observatory Small Plates",
  billId: "RCPT-77-QZ41",
  timestamp: "2026-05-13  21:08",
  lines: [
    {
      id: "ln-seed-1",
      qty: 3,
      description: "Sticky pork belly bao",
      amountCents: 20700,
    },
    {
      id: "ln-seed-2",
      qty: 1,
      description: "Sourdough & cultured butter",
      amountCents: 4200,
    },
    {
      id: "ln-seed-3",
      qty: 2,
      description: "Chenin blanc (glass)",
      amountCents: 11800,
    },
    {
      id: "ln-seed-4",
      qty: 1,
      description: "Charred broccolini, cashew",
      amountCents: 6200,
    },
    {
      id: "ln-seed-5",
      qty: 1,
      description: "Dark chocolate fondant",
      amountCents: 9899,
    },
    {
      id: "ln-seed-6",
      qty: 4,
      description: "Filter coffee",
      amountCents: 8800,
    },
    {
      id: "ln-seed-7",
      qty: 1,
      description: "Grilled halloumi & honey",
      amountCents: 5400,
    },
    {
      id: "ln-seed-8",
      qty: 2,
      description: "Sparkling water",
      amountCents: 3600,
    },
  ],
  vatCents: 9305,
  serviceFeeCents: 1500,
};
