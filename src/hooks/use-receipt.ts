import { useQuery } from "@tanstack/react-query";

import { getReceipt, receiptQueryKeys } from "@/api/billApi";
import type { ReceiptStatus } from "@/types/api";

const POLL_STATUSES: ReceiptStatus[] = ["draft", "processing"];

function shouldPollReceiptStatus(status: ReceiptStatus | undefined): boolean {
  return status !== undefined && POLL_STATUSES.includes(status);
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
    refetchInterval: (query) => {
      if (!pollWhileProcessing) {
        return false;
      }

      const status = query.state.data?.receipt.status;
      if (shouldPollReceiptStatus(status)) {
        return 1500;
      }

      return false;
    },
  });
}
