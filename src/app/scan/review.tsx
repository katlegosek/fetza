import { useLocalSearchParams } from "expo-router";

import { ReviewScreen } from "@/screens/review/ReviewScreen";
import { parseBillId } from "@/utils/parse-bill-id";

export default function ReviewBillScreen() {
  const { billId: billIdParam } = useLocalSearchParams<{
    billId?: string | string[];
  }>();
  const billId = parseBillId(billIdParam);

  return <ReviewScreen billId={billId} />;
}
