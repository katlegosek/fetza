import type { QueryClient } from "@tanstack/react-query";

import { billQueryKeys } from "@/api/billApi";

export async function invalidateBillQueries(
  queryClient: QueryClient,
  billId: number,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: billQueryKeys.detail(billId) }),
    queryClient.invalidateQueries({ queryKey: billQueryKeys.summary(billId) }),
    queryClient.invalidateQueries({ queryKey: billQueryKeys.list() }),
  ]);
}
