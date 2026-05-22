import { useLocalSearchParams } from "expo-router";

import { MissingBillState } from "@/components/molecules";
import { ReviewApiScreen } from "@/screens/review/ReviewApiScreen";
import { parseBillId } from "@/utils/parse-bill-id";

export default function ReviewBillScreen() {
  const { billId: billIdParam } = useLocalSearchParams<{
    billId?: string | string[];
  }>();
  const billId = parseBillId(billIdParam);

  if (billId <= 0) {
    return (
      <MissingBillState
        title="Review"
        message="Missing bill. Please open a bill from Home."
      />
    );
  }

  return <ReviewApiScreen billId={billId} />;
}
