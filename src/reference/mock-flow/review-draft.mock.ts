import type { DraftBill } from "@/types/draft-bill";

/** Seed payload for mock review flow (reference only). */
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
