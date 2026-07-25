import { useLocalSearchParams } from "expo-router";

import { MissingBillState } from "@/components/molecules";
import { ReviewApiScreen } from "@/screens/review/ReviewApiScreen";
import { parseBillId } from "@/utils/parse-bill-id";

export default function ConfirmReceiptRoute() {
  const { billId: billIdParam } = useLocalSearchParams<{
    billId?: string | string[];
  }>();
  const billId = parseBillId(billIdParam);

  if (billId <= 0) {
    return (
      <MissingBillState
        title="Confirm receipt"
        message="Missing bill. Please scan or open a bill first."
      />
    );
  }

  return <ReviewApiScreen billId={billId} />;
}
