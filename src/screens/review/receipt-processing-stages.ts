export type ReceiptProcessingStageKey =
  | "reading_receipt"
  | "finding_items"
  | "checking_prices"
  | "finding_fees"
  | "confirming_total"
  | "creating_table";

export type ReceiptProcessingStage = {
  key: ReceiptProcessingStageKey;
  heading: string;
  discoveryPill: string;
};

export const RECEIPT_PROCESSING_STAGES: readonly ReceiptProcessingStage[] = [
  {
    key: "reading_receipt",
    heading: "Reading your receipt...",
    discoveryPill: "Restaurant detected",
  },
  {
    key: "finding_items",
    heading: "Finding your items...",
    discoveryPill: "8 items found",
  },
  {
    key: "checking_prices",
    heading: "Checking prices...",
    discoveryPill: "Prices cleaned",
  },
  {
    key: "finding_fees",
    heading: "Finding fees & tax...",
    discoveryPill: "Tax identified",
  },
  {
    key: "confirming_total",
    heading: "Confirming the total...",
    discoveryPill: "Total verified",
  },
  {
    key: "creating_table",
    heading: "Creating your table...",
    discoveryPill: "Table ready",
  },
] as const;

export type ProcessingReceiptItem = {
  id: string;
  description: string;
  quantity: number;
  totalCents: number;
};

export const PROCESSING_DEMO_RECEIPT = {
  merchant: "Observatory Small Plates",
  timestamp: "2026/07/25  02:00",
  items: [
    {
      id: "demo-1",
      description: "Burrata & Heirloom Tomato",
      quantity: 1,
      totalCents: 9_500,
    },
    {
      id: "demo-2",
      description: "Grilled Calamari",
      quantity: 1,
      totalCents: 11_000,
    },
    {
      id: "demo-3",
      description: "Lamb Meatballs",
      quantity: 1,
      totalCents: 14_500,
    },
    {
      id: "demo-4",
      description: "Wild Mushroom Risotto",
      quantity: 1,
      totalCents: 12_500,
    },
    {
      id: "demo-5",
      description: "Pan-Seared Salmon",
      quantity: 1,
      totalCents: 16_500,
    },
    {
      id: "demo-6",
      description: "Chocolate Fondant",
      quantity: 1,
      totalCents: 8_500,
    },
    {
      id: "demo-7",
      description: "House Red Wine (750ml)",
      quantity: 1,
      totalCents: 22_000,
    },
    {
      id: "demo-8",
      description: "Espresso",
      quantity: 2,
      totalCents: 9_000,
    },
  ] satisfies ProcessingReceiptItem[],
  adjustments: [
    { id: "subtotal", label: "Subtotal", amountCents: 103_500 },
    {
      id: "service",
      label: "Service charge (10%)",
      amountCents: 10_350,
    },
    { id: "vat", label: "VAT (15%)", amountCents: 15_525 },
  ],
  totalCents: 113_850,
} as const;

export type ProcessingReceiptVisibility = {
  merchant: boolean;
  items: boolean;
  prices: boolean;
  fees: boolean;
  total: boolean;
  tableReady: boolean;
};

export function receiptVisibilityForStage(
  stageIndex: number,
  currentStageRevealed: boolean,
): ProcessingReceiptVisibility {
  const completedThrough = currentStageRevealed ? stageIndex : stageIndex - 1;

  return {
    merchant: completedThrough >= 0,
    items: completedThrough >= 1,
    prices: completedThrough >= 2,
    fees: completedThrough >= 3,
    total: completedThrough >= 4,
    tableReady: completedThrough >= 5,
  };
}
