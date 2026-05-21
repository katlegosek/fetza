import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getReceipt,
  uploadReceiptImage,
} from "@/services/receipts/receipt.service";
import type {
  ProcessingRunStatus,
  ReceiptStatus,
} from "@/services/receipts/types";

export const receiptQueryKeys = {
  all: ["receipts"] as const,
  details: () => [...receiptQueryKeys.all, "detail"] as const,
  detail: (receiptId: number) =>
    [...receiptQueryKeys.details(), receiptId] as const,
};

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

export function useReceipt(
  receiptId: number,
  options?: { pollWhileProcessing?: boolean },
) {
  const pollWhileProcessing = options?.pollWhileProcessing ?? false;

  return useQuery({
    queryKey: receiptQueryKeys.detail(receiptId),
    queryFn: () => getReceipt(receiptId),
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
}

export type UploadReceiptImageVariables = {
  billId: number;
  formData: FormData;
};

export function useUploadReceiptImage() {
  return useMutation({
    mutationFn: ({ billId, formData }: UploadReceiptImageVariables) =>
      uploadReceiptImage(billId, formData),
  });
}
