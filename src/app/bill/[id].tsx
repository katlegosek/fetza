import { useLocalSearchParams } from "expo-router";

import { BillDetailScreen } from "@/screens/bill-detail/BillDetailScreen";
import { parseBillId } from "@/utils/parse-bill-id";

export default function BillDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const billId = parseBillId(id);

  return <BillDetailScreen billId={billId} />;
}
