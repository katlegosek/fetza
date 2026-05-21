export type SheetState =
  | { kind: "line"; lineId: string }
  | { kind: "merchant" }
  | { kind: "totals" }
  | { kind: "adjustment"; adjustmentId: string }
  | null;

export const NEW_RECEIPT_ITEM_ID = "__new__";
export const NEW_RECEIPT_ADJUSTMENT_ID = "__new_adj__";
