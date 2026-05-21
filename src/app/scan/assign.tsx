import { useLocalSearchParams } from "expo-router";

import { AssignScreen } from "@/screens/assign/AssignScreen";
import { parseBillId } from "@/utils/parse-bill-id";

export default function AssignBillScreen() {
  const { billId: billIdParam, draft: draftParam } = useLocalSearchParams<{
    billId?: string | string[];
    draft?: string;
  }>();
  const billId = parseBillId(billIdParam);

  return <AssignScreen billId={billId} draftParam={draftParam} />;
}
