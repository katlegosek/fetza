import { useLocalSearchParams } from "expo-router";

import { MissingBillState } from "@/components/feedback";
import { AssignApiScreen } from "@/screens/assign/AssignApiScreen";
import { parseBillId } from "@/utils/parse-bill-id";

export default function AssignBillScreen() {
  const { billId: billIdParam } = useLocalSearchParams<{
    billId?: string | string[];
  }>();
  const billId = parseBillId(billIdParam);

  if (billId <= 0) {
    return (
      <MissingBillState
        title="Assign Items"
        message="Missing bill. Please open a bill before assigning items."
      />
    );
  }

  return <AssignApiScreen billId={billId} />;
}
