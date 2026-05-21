import { Redirect } from "expo-router";

export type SummaryApiScreenProps = {
  billId: number;
};

/** API bills use `/bill/[id]` — same as Assign API “View summary”. */
export const SummaryApiScreen = ({ billId }: SummaryApiScreenProps) => {
  return <Redirect href={`/bill/${billId}`} />;
};
