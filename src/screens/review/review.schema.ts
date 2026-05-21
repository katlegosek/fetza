import type { ZodError } from "zod";
import { z } from "zod";

import { isApiError } from "@/api/errors";
import type { ReviewAdjustmentSavePayload } from "@/components/review-adjustment-sheet";
import type { ReviewItemSavePayload } from "@/components/review-item-sheet";
import { ReceiptAdjustmentKindSchema } from "@/services/receipts/receipt.schema";

export const ReviewItemSaveSchema = z.object({
  description: z.string().trim().min(1, "Enter an item description."),
  qty: z
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1."),
  amountCents: z
    .number()
    .int("Enter a valid amount.")
    .min(0, "Amount must be zero or greater."),
});

export const ReviewAdjustmentSaveSchema = z.object({
  label: z.string().trim().min(1, "Enter a label for this line."),
  kind: ReceiptAdjustmentKindSchema,
  amountCents: z.number().int("Enter a valid amount."),
  affectsTotal: z.boolean(),
});

export type ReviewItemSave = z.infer<typeof ReviewItemSaveSchema>;
export type ReviewAdjustmentSave = z.infer<typeof ReviewAdjustmentSaveSchema>;

/** API errors, validation throws, and other Error messages; otherwise fallback. */
export function reviewSaveErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return fallback;
}

function validationMessage(error: ZodError): string {
  const first = error.issues[0];
  if (first?.message) {
    return first.message;
  }
  return "Please check the form and try again.";
}

export function validateReviewItemSave(
  payload: ReviewItemSavePayload,
): { ok: true; data: ReviewItemSave } | { ok: false; message: string } {
  const result = ReviewItemSaveSchema.safeParse(payload);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return { ok: false, message: validationMessage(result.error) };
}

export function validateReviewAdjustmentSave(
  payload: ReviewAdjustmentSavePayload,
): { ok: true; data: ReviewAdjustmentSave } | { ok: false; message: string } {
  const result = ReviewAdjustmentSaveSchema.safeParse(payload);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return { ok: false, message: validationMessage(result.error) };
}
