import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { isApiError } from "@/api/errors";
import { isAuthEnabled } from "@/lib/auth-config";
import { authKeys } from "@/services/auth/auth.keys";
import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
} from "@/services/auth/auth.service";
import { clearAuthTokens, getAccessToken } from "@/services/auth/auth.storage";
import type { AuthUser, LoginPayload } from "@/services/auth/types";
import { billQueryKeys } from "@/services/bills/bill.keys";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isAuthEnabled: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const authEnabled = isAuthEnabled();
  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadToken() {
      try {
        const token = await getAccessToken();
        if (!cancelled) {
          setHasToken(Boolean(token));
        }
      } finally {
        if (!cancelled) {
          setTokenChecked(true);
        }
      }
    }

    void loadToken();

    return () => {
      cancelled = true;
    };
  }, []);

  const {
    data: user,
    error: userError,
    isPending: isUserPending,
    isFetching: isUserFetching,
    refetch: refetchUser,
  } = useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    enabled: authEnabled && hasToken && tokenChecked,
    retry: false,
  });

  useEffect(() => {
    if (!authEnabled || !userError) {
      return;
    }

    if (!isApiError(userError) || userError.status !== 401) {
      return;
    }

    async function handleUnauthorized() {
      await clearAuthTokens();
      setHasToken(false);
      queryClient.removeQueries({ queryKey: authKeys.all });
    }

    void handleUnauthorized();
  }, [authEnabled, queryClient, userError]);

  const isLoadingAuth =
    !tokenChecked ||
    (authEnabled && hasToken && (isUserPending || isUserFetching) && !user);

  const isAuthenticated = authEnabled ? hasToken : true;

  const login = useCallback(
    async (payload: LoginPayload) => {
      const session = await loginService(payload);
      setHasToken(true);
      queryClient.setQueryData(authKeys.currentUser(), session.user);
      queryClient.setQueryData(authKeys.session(), session);
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await logoutService();
    setHasToken(false);
    queryClient.removeQueries({ queryKey: authKeys.all });
    queryClient.removeQueries({ queryKey: billQueryKeys.all });
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    if (!authEnabled) {
      return;
    }

    const token = await getAccessToken();
    setHasToken(Boolean(token));

    if (!token) {
      return;
    }

    await refetchUser();
  }, [authEnabled, refetchUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: authEnabled ? (user ?? null) : null,
      isAuthenticated,
      isLoadingAuth,
      isAuthEnabled: authEnabled,
      login,
      logout,
      refreshUser,
    }),
    [
      authEnabled,
      isAuthenticated,
      isLoadingAuth,
      login,
      logout,
      refreshUser,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
