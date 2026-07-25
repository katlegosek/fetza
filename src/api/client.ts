import Constants from "expo-constants";

import { ApiError } from "@/api/errors";
import { getAccessToken } from "@/services/auth/auth.storage";

const MOBILE_API_PREFIX = "/api/mobile/v1";
const PUBLIC_API_PREFIX = "/api/public/v1";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
}

export interface ApiMultipartRequestOptions {
  method?: "POST" | "PATCH" | "PUT";
  formData: FormData;
}

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  const baseUrl = fromEnv ?? fromExtra;

  if (!baseUrl) {
    throw new Error(
      "API base URL is not configured. Set EXPO_PUBLIC_API_URL or expo.extra.apiUrl.",
    );
  }

  return baseUrl.replace(/\/$/, "");
}

export function mobileApiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${MOBILE_API_PREFIX}${normalized}`;
}

function resolveMobileApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const apiPath = normalized.startsWith(MOBILE_API_PREFIX)
    ? normalized
    : mobileApiPath(normalized);
  return `${getApiBaseUrl()}${apiPath}`;
}

function resolvePublicApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const apiPath = normalized.startsWith(PUBLIC_API_PREFIX)
    ? normalized
    : `${PUBLIC_API_PREFIX}${normalized}`;
  return `${getApiBaseUrl()}${apiPath}`;
}

// TODO(production): Remove ngrok header block — dev tunnel only. See docs/DEV_ONLY_TODOS.md
/** ngrok free tier returns an HTML interstitial unless this header is sent. */
function apiFetchHeaders(
  extra: Record<string, string> = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...extra,
  };

  if (getApiBaseUrl().includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "true";
  }

  return headers;
}

async function buildRequestHeaders(
  extra: Record<string, string> = {},
): Promise<Record<string, string>> {
  const headers = apiFetchHeaders(extra);
  const token = await getAccessToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body } = options;
  const url = resolveMobileApiUrl(path);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: await buildRequestHeaders(
        body !== undefined ? { "Content-Type": "application/json" } : {},
      ),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw ApiError.network();
  }

  const data = await parseJson(response);

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, data);
  }

  return data as T;
}

export async function publicApiRequest<T>(
  path: string,
  options: ApiRequestOptions & { guestToken?: string | null } = {},
): Promise<T> {
  const { method = "GET", body, guestToken } = options;

  let response: Response;
  try {
    response = await fetch(resolvePublicApiUrl(path), {
      method,
      headers: apiFetchHeaders({
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(guestToken ? { Authorization: `Bearer ${guestToken}` } : {}),
      }),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw ApiError.network();
  }

  const data = await parseJson(response);
  if (!response.ok) {
    throw ApiError.fromResponse(response.status, data);
  }

  return data as T;
}

export async function apiMultipartRequest<T>(
  path: string,
  options: ApiMultipartRequestOptions,
): Promise<T> {
  const { method = "POST", formData } = options;
  const url = resolveMobileApiUrl(path);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: await buildRequestHeaders(),
      body: formData,
    });
  } catch {
    throw ApiError.network();
  }

  const data = await parseJson(response);

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, data);
  }

  return data as T;
}
