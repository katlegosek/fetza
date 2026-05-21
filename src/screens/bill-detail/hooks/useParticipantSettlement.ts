import { useCallback, useEffect, useState } from "react";

import { billDetailSettlementErrorMessage } from "@/screens/bill-detail/bill-detail.helpers";
import type { BillSummaryParticipant } from "@/services/bills/bill.types";
import { useBillParticipants } from "@/services/participants/participant.hooks";

export function useParticipantSettlement(billId: number) {
  const { toggleParticipantSettled } = useBillParticipants(billId);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (!summaryError) {
      return;
    }

    const timeout = setTimeout(() => setSummaryError(null), 4000);
    return () => clearTimeout(timeout);
  }, [summaryError]);

  const showSettlementError = useCallback((saveError: unknown) => {
    setSummaryError(billDetailSettlementErrorMessage(saveError));
  }, []);

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
