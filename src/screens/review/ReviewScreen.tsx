import { ReviewBillFromApi } from "@/screens/review/ReviewBillFromApi";
import { ReviewBillMock } from "@/screens/review/ReviewBillMock";

export type ReviewScreenProps = {
  billId: number;
};

export const ReviewScreen = ({ billId }: ReviewScreenProps) => {
  if (billId > 0) {
    return <ReviewBillFromApi billId={billId} />;
  }

  // TODO(production): Redirect to scan or require billId — drop mock fallback
  return <ReviewBillMock />;
};
