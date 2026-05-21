import { useLocalSearchParams } from "expo-router";

import { ReviewApiScreen } from "@/screens/review/ReviewApiScreen";
import { ReviewMockScreen } from "@/screens/review/ReviewMockScreen";
import { parseBillId } from "@/utils/parse-bill-id";

export default function ReviewBillScreen() {
  const { billId: billIdParam } = useLocalSearchParams<{
    billId?: string | string[];
  }>();
  const billId = parseBillId(billIdParam);

  // Mock fallback is kept for local/demo flows without billId. API mode is the primary path.
  if (billId > 0) {
    return <ReviewApiScreen billId={billId} />;
  }

  return <ReviewMockScreen />;
}
