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
import { isAuthSessionError } from "@/services/auth/auth.errors";
import { authKeys } from "@/services/auth/auth.keys";
import authService from "@/services/auth/auth.service";
import { getAccessToken } from "@/services/auth/auth.storage";
import type { AuthUser, LoginPayload } from "@/services/auth/types";
import { billQueryKeys } from "@/services/bills/bill.keys";

import { isAuthEnabled } from "./auth-config";

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

const syncHasToken = async (
  setHasToken: (value: boolean) => void,
): Promise<void> => {
  const token = await getAccessToken();
  setHasToken(Boolean(token));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const authEnabled = isAuthEnabled();
  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadToken = async () => {
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
    };

    void loadToken();

    return () => {
      cancelled = true;
    };
  }, []);

  const {
    data: user,
    error: sessionError,
    isPending: isSessionPending,
    isFetching: isSessionFetching,
    refetch: refetchSession,
  } = useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.restoreSession,
    enabled: authEnabled && hasToken && tokenChecked,
    retry: false,
  });

  useEffect(() => {
    if (!authEnabled || !sessionError) {
      return;
    }

    if (isAuthSessionError(sessionError) || isApiError(sessionError)) {
      void syncHasToken(setHasToken);
    }
  }, [authEnabled, sessionError]);

  // True while we still need to wait for SecureStore + /me before we know
  // whether the user is actually signed in. We deliberately keep loading
  // alive across the whole token-then-user check so AuthRouteGuard does
  // not bounce a returning user to /auth/login while restoreSession is
  // still in flight (or while a transparent 401 → refresh → /me retry
  // inside authService.restoreSession is still running).
  const isVerifyingSession =
    authEnabled &&
    hasToken &&
    user === undefined &&
    !sessionError &&
    (isSessionPending || isSessionFetching);

  const isLoadingAuth = !tokenChecked || isVerifyingSession;

  // Auth-disabled (dev) mode short-circuits to "authenticated" so the
  // app stays usable without a backend session. With auth enabled, a
  // SecureStore token alone is not enough — a stale/expired token must
  // not look authenticated until /me (with a transparent refresh inside
  // authService.restoreSession) actually returns a user. If that whole
  // dance fails, restoreSession clears the tokens and the syncHasToken
  // effect above flips hasToken to false, so this condition stays false.
  const isAuthenticated = authEnabled ? hasToken && user != null : true;

  const login = useCallback(
    async (payload: LoginPayload) => {
      const session = await authService.login(payload);
      setHasToken(true);
      queryClient.setQueryData(authKeys.currentUser(), session.user);
      queryClient.setQueryData(authKeys.session(), session);
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setHasToken(false);
    queryClient.removeQueries({ queryKey: authKeys.all });
    queryClient.removeQueries({ queryKey: billQueryKeys.all });
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    if (!authEnabled) {
      return;
    }

    await syncHasToken(setHasToken);
    const token = await getAccessToken();

    if (!token) {
      return;
    }

    await refetchSession();
  }, [authEnabled, refetchSession]);

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
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
