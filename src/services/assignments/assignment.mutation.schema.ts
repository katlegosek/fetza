import { z } from "zod";

import { BillSummaryResponseSchema } from "@/services/bills/bill-summary.schema";
import { ReceiptItemSchema } from "@/services/receipts/receipt-item.schema";

export const ItemAssignmentMutationResponseSchema = z.object({
  receipt_item: ReceiptItemSchema,
  bill_summary: BillSummaryResponseSchema,
});

export type ItemAssignmentMutationResponse = z.infer<
  typeof ItemAssignmentMutationResponseSchema
>;
