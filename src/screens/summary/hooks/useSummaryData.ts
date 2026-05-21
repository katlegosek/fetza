import { useMemo } from "react";

import type { SettlementMap } from "@/lib/member-settlement-storage";
import {
  buildSummaryModel,
  parseSummaryPayload,
  sortMembersYouFirst,
} from "@/screens/summary/summary.helpers";

export function useSummaryData(
  dataParam: string | undefined,
  settlementByMember: SettlementMap,
) {
  const payload = useMemo(() => parseSummaryPayload(dataParam), [dataParam]);

  const model = useMemo(
    () => (payload ? buildSummaryModel(payload) : null),
    [payload],
  );

  const settlementBillId = payload?.draft.billId ?? "";

  const listMembersOrdered = useMemo(
    () => (model ? sortMembersYouFirst(model.members) : []),
    [model],
  );

  const merchantHint = useMemo(() => {
    const merchant = model?.draft.merchant.trim();
    return merchant && merchant.length > 0 ? merchant : undefined;
  }, [model]);

  const outstandingCents = useMemo(() => {
    if (!model) return 0;
    return model.members.reduce((s, m) => {
      if (settlementByMember[m.id]?.settled) return s;
      return s + (model.owed[m.id] ?? 0);
    }, 0);
  }, [model, settlementByMember]);

  const unpaidCount = useMemo(() => {
    if (!model) return 0;
    return model.members.filter(
      (m) => (model.owed[m.id] ?? 0) > 0 && !settlementByMember[m.id]?.settled,
    ).length;
  }, [model, settlementByMember]);

  return {
    payload,
    model,
    settlementBillId,
    listMembersOrdered,
    merchantHint,
    outstandingCents,
    unpaidCount,
  };
}
