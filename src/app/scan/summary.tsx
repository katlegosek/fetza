import { useLocalSearchParams } from "expo-router";

import { SummaryApiScreen } from "@/screens/summary/SummaryApiScreen";
import { SummaryMockScreen } from "@/screens/summary/SummaryMockScreen";
import { parseBillId } from "@/utils/parse-bill-id";
import { asSingleRouteParam } from "@/utils/route-params";

export default function BillSummaryScreen() {
  const { billId: billIdParam, data: dataParamRaw } = useLocalSearchParams<{
    billId?: string | string[];
    data?: string | string[];
  }>();
  const billId = parseBillId(billIdParam);
  const dataParam = asSingleRouteParam(dataParamRaw);

  // Mock fallback is kept for local/demo flows without billId. API mode is the primary path.
  if (billId > 0) {
    return <SummaryApiScreen billId={billId} />;
  }

  return <SummaryMockScreen dataParam={dataParam} />;
}
