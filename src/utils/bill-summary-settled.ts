import type { BillSummary } from "@/services/bills/types";

/** Optimistic summary patch when toggling a participant's settled flag. */
export function applyOptimisticParticipantSettled(
  summary: BillSummary,
  participantId: number,
  settled: boolean,
): BillSummary {
  const participants = summary.participants.map((participant) =>
    participant.id === participantId
      ? { ...participant, settled }
      : participant,
  );

  let settledTotalCents = 0;
  let outstandingTotalCents = 0;

  for (const participant of participants) {
    if (participant.settled) {
      settledTotalCents += participant.amount_due_cents;
    } else {
      outstandingTotalCents += participant.amount_due_cents;
    }
  }

  return {
    ...summary,
    participants,
    totals: {
      ...summary.totals,
      settled_total_cents: settledTotalCents,
      outstanding_total_cents: outstandingTotalCents,
    },
  };
}
