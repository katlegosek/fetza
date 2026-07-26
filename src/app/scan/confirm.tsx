import { useLocalSearchParams } from "expo-router";

import {
  ReceiptScreen,
  type ReceiptScreenMode,
} from "@/screens/review/ReceiptScreen";
import { parseBillId } from "@/utils/parse-bill-id";

export default function ConfirmReceiptRoute() {
  const {
    billId: billIdParam,
    receiptId: receiptIdParam,
    mode,
    imageUri: imageUriParam,
  } = useLocalSearchParams<{
    billId?: string | string[];
    receiptId?: string | string[];
    mode?: string | string[];
    imageUri?: string | string[];
  }>();
  const billId = parseBillId(billIdParam);
  const receiptId = parseBillId(receiptIdParam);
  const selectedMode = Array.isArray(mode) ? mode[0] : mode;
  const imageUri = Array.isArray(imageUriParam)
    ? imageUriParam[0]
    : imageUriParam;
  const receiptMode: ReceiptScreenMode =
    selectedMode === "manual"
      ? "manual"
      : selectedMode === "processing"
        ? "processing"
        : "ready";

  return (
    <ReceiptScreen
      billId={billId}
      imageUri={imageUri}
      mode={receiptMode}
      receiptId={receiptId}
    />
  );
}
