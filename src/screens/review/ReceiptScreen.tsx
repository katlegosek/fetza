import { MissingBillState } from "@/components/molecules";
import { ManualReceiptScreen } from "@/screens/review/ManualReceiptScreen";
import { ProcessingReceiptScreen } from "@/screens/review/ProcessingReceiptScreen";
import { ReviewApiScreen } from "@/screens/review/ReviewApiScreen";

export type ReceiptScreenMode = "manual" | "processing" | "ready";

export const ReceiptScreen = ({
  mode,
  billId,
  receiptId,
  imageUri,
}: {
  mode: ReceiptScreenMode;
  billId: number;
  receiptId: number;
  imageUri?: string;
}) => {
  if (mode === "manual") {
    return <ManualReceiptScreen />;
  }

  if (mode === "processing") {
    if (receiptId <= 0 && !imageUri) {
      return (
        <MissingBillState
          title="Receipt"
          message="Missing receipt image. Please scan or upload it again."
        />
      );
    }

    return (
      <ProcessingReceiptScreen
        billId={billId}
        imageUri={imageUri}
        receiptId={receiptId}
      />
    );
  }

  if (billId <= 0) {
    return (
      <MissingBillState
        title="Confirm receipt"
        message="Missing bill. Please scan or open a bill first."
      />
    );
  }

  return <ReviewApiScreen billId={billId} />;
};
