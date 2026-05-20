import { useQuery } from "@tanstack/react-query";

import { billQueryKeys, getBills } from "@/api/billApi";

export function useBills() {
  return useQuery({
    queryKey: billQueryKeys.list(),
    queryFn: getBills,
  });
}
