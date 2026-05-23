import { apiRequest } from "@/api/client";
import { isApiError } from "@/api/errors";
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
} from "@/services/auth/types";

const login = async (payload: LoginPayload): Promise<AuthSession> => {
  const data = await apiRequest<unknown>(authUrls.login(), {
    method: "POST",
    body: payload,
  });
  const session = loginModel(data);
  await setAuthTokens({
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  });
  return session;
};

const logout = async (): Promise<void> => {
  try {
    await apiRequest<unknown>(authUrls.logout(), { method: "POST" });
  } catch {
    // Always clear local session even when the backend logout call fails.
  } finally {
    await clearAuthTokens();
  }
};

const getCurrentUser = async (): Promise<AuthUser> => {
  const data = await apiRequest<unknown>(authUrls.me());
  return meModel(data);
};

const refreshSession = async (): Promise<AuthSession> => {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new AuthSessionError(
      "No refresh token available. Please sign in again.",
    );
  }

  const data = await apiRequest<unknown>(authUrls.refresh(), {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
  const session = loginModel(data);
  await setAuthTokens({
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  });
  return session;
};

/** Load the current user, refreshing tokens once on 401. Clears tokens if session cannot be restored. */
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
