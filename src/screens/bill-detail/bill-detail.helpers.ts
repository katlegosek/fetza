import type { BillSummaryParticipant } from "@/services/bills/types";

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
