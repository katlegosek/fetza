import { useMutation, useQuery } from "@tanstack/react-query";

import { receiptQueryKeys } from "@/services/receipts/receipt.keys";
import receiptService from "@/services/receipts/receipt.service";
import type {
  ProcessingRunStatus,
  ReceiptStatus,
} from "@/services/receipts/types";

const TERMINAL_RECEIPT_STATUSES: ReceiptStatus[] = [
  "ready",
  "confirmed",
  "failed",
];

const TERMINAL_PROCESSING_RUN_STATUSES: ProcessingRunStatus[] = [
  "completed",
  "failed",
];

export function isReceiptProcessingComplete(
  receiptStatus: ReceiptStatus | undefined,
  processingRunStatus: ProcessingRunStatus | undefined | null,
): boolean {
  if (
    receiptStatus !== undefined &&
    TERMINAL_RECEIPT_STATUSES.includes(receiptStatus)
  ) {
    return true;
  }

  if (
    processingRunStatus !== undefined &&
    processingRunStatus !== null &&
    TERMINAL_PROCESSING_RUN_STATUSES.includes(processingRunStatus)
  ) {
    return true;
  }

  return false;
}

function shouldPollReceipt(
  receiptStatus: ReceiptStatus | undefined,
  processingRunStatus: ProcessingRunStatus | undefined | null,
): boolean {
  if (isReceiptProcessingComplete(receiptStatus, processingRunStatus)) {
    return false;
  }

  return receiptStatus === "draft" || receiptStatus === "processing";
}

export const useReceipt = (
  receiptId: number,
  options?: { pollWhileProcessing?: boolean },
) => {
  const pollWhileProcessing = options?.pollWhileProcessing ?? false;

  return useQuery({
    queryKey: receiptQueryKeys.detail(receiptId),
    queryFn: () => receiptService.getReceipt(receiptId),
    enabled: receiptId > 0,
    refetchIntervalInBackground: false,
    refetchInterval: (query) => {
      if (!pollWhileProcessing) {
        return false;
      }

      const status = query.state.data?.receipt.status;
      const processingRunStatus = query.state.data?.processing_run?.status;

      if (shouldPollReceipt(status, processingRunStatus)) {
        return 1500;
      }

      return false;
    },
  });
};

export type UploadReceiptImageVariables = {
  billId: number;
  formData: FormData;
};

export const useUploadReceiptImage = () =>
  useMutation({
    mutationFn: ({ billId, formData }: UploadReceiptImageVariables) =>
      receiptService.uploadReceiptImage(billId, formData),
  });

export const useConfirmReceipt = () =>
  useMutation({
    mutationFn: (receiptId: number) => receiptService.confirmReceipt(receiptId),
  });
