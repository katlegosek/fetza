import { usePullToRefresh } from "@/hooks";
import { useBillSummary } from "@/services/bills/bill.hooks";

export const useBillDetailData = (billId: number) => {
  const { data, isLoading, isError, error, refetch } = useBillSummary(billId);
  const { refreshing: pullRefreshing, onRefresh: onPullRefresh } =
    usePullToRefresh(refetch);

  const headerTitle = data?.bill.title ?? "Summary";

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    pullRefreshing,
    onPullRefresh,
    headerTitle,
  };
};
