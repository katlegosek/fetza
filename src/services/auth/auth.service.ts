import { apiRequest } from "@/api/client";
import {
  parseLoginResponse,
  parseMeResponse,
} from "@/services/auth/auth.model";
import { clearAccessToken, setAccessToken } from "@/services/auth/auth.storage";
import { authUrls } from "@/services/auth/auth.urls";
import type {
  LoginPayload,
  LoginResponse,
  MeResponse,
} from "@/services/auth/types";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await apiRequest<unknown>(authUrls.login(), {
    method: "POST",
    body: payload,
  });
  const response = parseLoginResponse(data);
  await setAccessToken(response.session.access_token);
  return response;
}

export async function logout(): Promise<void> {
  await apiRequest<unknown>(authUrls.logout(), { method: "POST" });
  await clearAccessToken();
}

export async function getCurrentUser(): Promise<MeResponse> {
  // TODO(auth): attach Authorization header from getAccessToken() once Rails auth is wired
  const data = await apiRequest<unknown>(authUrls.me());
  return parseMeResponse(data);
}

export async function refreshSession(): Promise<LoginResponse> {
  // TODO(auth): send refresh token when Rails auth refresh contract is defined
  const data = await apiRequest<unknown>(authUrls.refresh(), {
    method: "POST",
  });
  const response = parseLoginResponse(data);
  await setAccessToken(response.session.access_token);
  return response;
}
