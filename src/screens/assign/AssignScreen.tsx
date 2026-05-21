import { AssignApiScreen } from "@/screens/assign/AssignApiScreen";
import { AssignMockScreen } from "@/screens/assign/AssignMockScreen";

export type AssignScreenProps = {
  billId: number;
  draftParam?: string;
};

export const AssignScreen = ({ billId, draftParam }: AssignScreenProps) => {
  if (billId > 0) {
    return <AssignApiScreen billId={billId} />;
  }

  return <AssignMockScreen draftParam={draftParam} />;
};
