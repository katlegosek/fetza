import { isApiError } from "@/api/errors";
import type { BillSummaryParticipant } from "@/services/bills/bill.types";

export function sortBillDetailParticipants(
  participants: BillSummaryParticipant[],
): BillSummaryParticipant[] {
  return [...participants].sort((a, b) => {
    const aSeat = a.seat_index ?? Number.MAX_SAFE_INTEGER;
    const bSeat = b.seat_index ?? Number.MAX_SAFE_INTEGER;
    if (aSeat !== bSeat) {
      return aSeat - bSeat;
    }

    return a.name.localeCompare(b.name);
  });
}

export function billDetailLoadErrorMessage(error: unknown): string {
  return isApiError(error)
    ? error.message
    : "Something went wrong loading this bill.";
}

export function billDetailSettlementErrorMessage(error: unknown): string {
  return isApiError(error)
    ? error.message
    : "Could not update payment status. Please try again.";
}
