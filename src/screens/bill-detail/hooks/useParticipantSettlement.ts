import { useCallback } from "react";

import { MUTATION_ERROR_FALLBACKS } from "@/api/api-error-message";
import { useMutationErrorBanner } from "@/hooks/use-mutation-error-banner";
import type { BillSummaryParticipant } from "@/services/bills/bill.types";
import { useBillParticipants } from "@/services/participants/participant.hooks";

export function useParticipantSettlement(billId: number) {
  const { toggleParticipantSettled } = useBillParticipants(billId);
  const {
    message: summaryError,
    setMessage: setSummaryError,
    showError: showSettlementError,
  } = useMutationErrorBanner(MUTATION_ERROR_FALLBACKS.billDetailSettlement);

  const handleToggleSettled = useCallback(
    (participant: BillSummaryParticipant) => {
      toggleParticipantSettled.mutate(
        {
          participantId: participant.id,
          settled: !participant.settled,
        },
        { onError: showSettlementError },
      );
    },
    [showSettlementError, toggleParticipantSettled],
  );

  return {
    summaryError,
    setSummaryError,
    handleToggleSettled,
  };
}
