import { isApiError } from "@/api/errors";

/** Default fallback copy when a bill-related mutation fails. */
export const MUTATION_ERROR_FALLBACKS = {
  assignAssignment: "Could not save assignment. Please try again.",
  billDetailSettlement: "Could not update payment status. Please try again.",
  reviewSaveItem: "Couldn't save item. Please try again.",
  reviewDeleteItem: "Couldn't remove item. Please try again.",
  reviewSaveAdjustment: "Couldn't save fee or tax.",
  reviewDeleteAdjustment: "Couldn't remove fee or tax.",
  scanUploadReceipt: "Couldn't upload receipt. Try again.",
} as const;

/**
 * Prefer `ApiError.message`, then other `Error.message` (e.g. validation throws),
 * otherwise `fallback`.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
