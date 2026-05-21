import { Redirect } from "expo-router";

/**
 * Primary summary path for API bills: redirects to bill detail (`/bill/[id]`).
 * Mock table/list UI lives in {@link SummaryMockScreen}.
 */
export type SummaryApiScreenProps = {
  billId: number;
};

export const SummaryApiScreen = ({ billId }: SummaryApiScreenProps) => {
  return <Redirect href={`/bill/${billId}`} />;
};
