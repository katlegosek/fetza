import { useLocalSearchParams } from "expo-router";

import { AssignApiScreen } from "@/screens/assign/AssignApiScreen";
import { AssignMockScreen } from "@/screens/assign/AssignMockScreen";
import { parseBillId } from "@/utils/parse-bill-id";
import { asSingleRouteParam } from "@/utils/route-params";

export default function AssignBillScreen() {
  const { billId: billIdParam, draft: draftParamRaw } = useLocalSearchParams<{
    billId?: string | string[];
    draft?: string | string[];
  }>();
  const billId = parseBillId(billIdParam);
  const draftParam = asSingleRouteParam(draftParamRaw);

  // Mock fallback is kept for local/demo flows without billId. API mode is the primary path.
  if (billId > 0) {
    return <AssignApiScreen billId={billId} />;
  }

  return <AssignMockScreen draftParam={draftParam} />;
}
