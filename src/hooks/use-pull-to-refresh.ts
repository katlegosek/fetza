import { useCallback, useState } from "react";

/**
 * Drives RefreshControl from a user pull only.
 * Avoids iOS "offscreen beginRefreshing" when React Query refetches in the background.
 */
export const usePullToRefresh = (refetch: () => Promise<unknown>) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void refetch().finally(() => {
      setRefreshing(false);
    });
  }, [refetch]);

  return { refreshing, onRefresh };
};
