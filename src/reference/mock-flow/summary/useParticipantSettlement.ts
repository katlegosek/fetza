import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import {
  type SettlementMap,
  isMemberSettled,
  loadSettlementMap,
  saveMemberSettlement,
} from "@/reference/mock-flow/lib/member-settlement-storage";

export function useParticipantSettlement(settlementBillId: string) {
  const [settlementByMember, setSettlementByMember] = useState<SettlementMap>(
    {},
  );

  useFocusEffect(
    useCallback(() => {
      if (!settlementBillId) return;
      void loadSettlementMap(settlementBillId).then(setSettlementByMember);
    }, [settlementBillId]),
  );

  const toggleMemberPaid = useCallback(
    async (memberId: string) => {
      if (!settlementBillId || !memberId) return;
      const was = isMemberSettled(settlementByMember, memberId);
      if (was) {
        setSettlementByMember((p) => ({
          ...p,
          [memberId]: { settled: false, paidAtIso: null },
        }));
        await saveMemberSettlement(settlementBillId, memberId, false, null);
        return;
      }
      const d = new Date();
      const iso = d.toISOString();
      setSettlementByMember((p) => ({
        ...p,
        [memberId]: { settled: true, paidAtIso: iso },
      }));
      await saveMemberSettlement(settlementBillId, memberId, true, iso);
    },
    [settlementBillId, settlementByMember],
  );

  return {
    settlementByMember,
    toggleMemberPaid,
  };
}
