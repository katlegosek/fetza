import { useLocalSearchParams } from "expo-router";

import { SummaryScreen } from "@/screens/summary/SummaryScreen";
import { asSingleParam } from "@/screens/summary/summary.helpers";
import { parseBillId } from "@/utils/parse-bill-id";

export default function BillSummaryScreen() {
  const { billId: billIdParam, data: dataParamRaw } = useLocalSearchParams<{
    billId?: string | string[];
    data?: string | string[];
  }>();
  const billId = parseBillId(billIdParam);
  const dataParam = asSingleParam(dataParamRaw);

  return <SummaryScreen billId={billId} dataParam={dataParam} />;
}
