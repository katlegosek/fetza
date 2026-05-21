import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authKeys } from "@/services/auth/auth.keys";
import {
  getCurrentUser,
  login,
  logout,
  refreshSession,
} from "@/services/auth/auth.service";
import type { LoginPayload } from "@/services/auth/types";
import { billQueryKeys } from "@/services/bills/bill.keys";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.currentUser(), session.user);
      queryClient.setQueryData(authKeys.session(), session);
      void queryClient.invalidateQueries({
        queryKey: authKeys.currentUser(),
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.removeQueries({ queryKey: billQueryKeys.all });
    },
  });
}

export function useCurrentUser(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    enabled: options?.enabled ?? false,
    retry: false,
  });
}

export function useRefreshSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshSession,
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.currentUser(), session.user);
      queryClient.setQueryData(authKeys.session(), session);
      void queryClient.invalidateQueries({
        queryKey: authKeys.currentUser(),
      });
    },
  });
}
