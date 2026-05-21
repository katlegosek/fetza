import { SummaryApiScreen } from "@/screens/summary/SummaryApiScreen";
import { SummaryMockScreen } from "@/screens/summary/SummaryMockScreen";

export type SummaryScreenProps = {
  billId: number;
  dataParam?: string;
};

export const SummaryScreen = ({ billId, dataParam }: SummaryScreenProps) => {
  if (billId > 0) {
    return <SummaryApiScreen billId={billId} />;
  }

  return <SummaryMockScreen dataParam={dataParam} />;
};
