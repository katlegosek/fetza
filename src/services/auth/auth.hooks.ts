import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "@/services/auth/auth.keys";
import {
  getCurrentUser,
  login,
  logout,
  refreshSession,
} from "@/services/auth/auth.service";
import type { LoginPayload } from "@/services/auth/types";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: authQueryKeys.currentUser(),
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKeys.currentUser(),
    queryFn: getCurrentUser,
  });
}

export function useRefreshSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: authQueryKeys.currentUser(),
      });
    },
  });
}
