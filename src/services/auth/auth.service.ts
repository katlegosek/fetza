import { isApiError } from "@/api/errors";
import networkService from "@/api/network-service";
import { AuthSessionError } from "@/services/auth/auth.errors";
import { loginModel, meModel } from "@/services/auth/auth.model";
import {
  clearAuthTokens,
  getRefreshToken,
  setAuthTokens,
} from "@/services/auth/auth.storage";
import authUrls from "@/services/auth/auth.urls";
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RefreshPayload,
} from "@/services/auth/types";

const login = async (payload: LoginPayload): Promise<AuthSession> => {
  const data = await networkService.post<unknown, LoginPayload>(
    authUrls.login(),
    payload,
  );
  const session = loginModel(data);
  await setAuthTokens({
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  });
  return session;
};

const logout = async (): Promise<void> => {
  try {
    await networkService.post<unknown>(authUrls.logout());
  } catch {
    // Always clear local session even when the backend logout call fails.
  } finally {
    await clearAuthTokens();
  }
};

const getCurrentUser = async (): Promise<AuthUser> => {
  const data = await networkService.get<unknown>(authUrls.me());
  return meModel(data);
};

const refreshSession = async (): Promise<AuthSession> => {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new AuthSessionError(
      "No refresh token available. Please sign in again.",
    );
  }

  const data = await networkService.post<unknown, RefreshPayload>(
    authUrls.refresh(),
    { refresh_token: refreshToken },
  );
  const session = loginModel(data);
  await setAuthTokens({
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  });
  return session;
};

/**
 * Load the current user, refreshing tokens once on 401. Clears tokens
 * if the session cannot be restored end-to-end.
 */
const restoreSession = async (): Promise<AuthUser> => {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (!isApiError(error) || error.status !== 401) {
      throw error;
    }

    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      await clearAuthTokens();
      throw new AuthSessionError("Session expired. Please sign in again.");
    }

    try {
      await refreshSession();
      return await getCurrentUser();
    } catch (refreshError) {
      await clearAuthTokens();
      throw refreshError;
    }
  }
};

export default {
  login,
  logout,
  getCurrentUser,
  refreshSession,
  restoreSession,
};
