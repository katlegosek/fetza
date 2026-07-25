import { useLocalSearchParams } from "expo-router";

import { MissingBillState } from "@/components/molecules";
import { BillRoomScreen } from "@/screens/bill-room";
import { parseBillId } from "@/utils/parse-bill-id";

export default function BillRoomRoute() {
  const { billId: billIdParam } = useLocalSearchParams<{
    billId?: string | string[];
  }>();
  const billId = parseBillId(billIdParam);

  if (billId <= 0) {
    return (
      <MissingBillState
        title="Breakdown"
        message="Missing bill. Please open a bill from Home."
      />
    );
  }

  return <BillRoomScreen billId={billId} />;
}
