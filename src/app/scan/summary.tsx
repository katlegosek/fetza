import { useLocalSearchParams } from "expo-router";

import { MissingBillState } from "@/components/feedback";
import { SummaryApiScreen } from "@/screens/summary/SummaryApiScreen";
import { parseBillId } from "@/utils/parse-bill-id";

export default function BillSummaryScreen() {
  const { billId: billIdParam } = useLocalSearchParams<{
    billId?: string | string[];
  }>();
  const billId = parseBillId(billIdParam);

  if (billId <= 0) {
    return (
      <MissingBillState
        title="Summary"
        message="Missing bill. Please open a bill before viewing the summary."
      />
    );
  }

  return <SummaryApiScreen billId={billId} />;
}
