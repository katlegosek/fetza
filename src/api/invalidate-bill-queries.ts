import type { QueryClient } from "@tanstack/react-query";

import { billRoomQueryKeys } from "@/services/bill-room/bill-room.keys";
import { billQueryKeys } from "@/services/bills/bill.keys";

/**
 * Refetch bill detail, bill summary, and the bills list after a bill-related mutation.
 */
export async function invalidateBillQueries(
  queryClient: QueryClient,
  billId: number,
): Promise<void> {
  if (billId <= 0) {
    return;
  }

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: billQueryKeys.detail(billId) }),
    queryClient.invalidateQueries({ queryKey: billQueryKeys.summary(billId) }),
    queryClient.invalidateQueries({ queryKey: billQueryKeys.list() }),
    queryClient.invalidateQueries({
      queryKey: billRoomQueryKeys.detail(billId),
    }),
  ]);
}
