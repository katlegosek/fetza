import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authKeys } from "@/services/auth/auth.keys";
import authService from "@/services/auth/auth.service";
import type { LoginPayload } from "@/services/auth/types";
import { billQueryKeys } from "@/services/bills/bill.keys";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.currentUser(), session.user);
      queryClient.setQueryData(authKeys.session(), session);
      void queryClient.invalidateQueries({
        queryKey: authKeys.currentUser(),
      });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.removeQueries({ queryKey: billQueryKeys.all });
    },
  });
};

export const useCurrentUser = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getCurrentUser,
    enabled: options?.enabled ?? false,
    retry: false,
  });

export const useRefreshSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.refreshSession,
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.currentUser(), session.user);
      queryClient.setQueryData(authKeys.session(), session);
      void queryClient.invalidateQueries({
        queryKey: authKeys.currentUser(),
      });
    },
  });
};
