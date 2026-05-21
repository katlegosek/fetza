import { Redirect } from "expo-router";

/** API summary: redirects to bill detail (`/bill/[id]`). */
export type SummaryApiScreenProps = {
  billId: number;
};

export const SummaryApiScreen = ({ billId }: SummaryApiScreenProps) => {
  return <Redirect href={`/bill/${billId}`} />;
};
