import Constants from "expo-constants";

import { ApiError } from "@/api/errors";

const MOBILE_API_PREFIX = "/api/mobile/v1";

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
  const url = `${getApiBaseUrl()}${mobileApiPath(path)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
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
  const url = `${getApiBaseUrl()}${mobileApiPath(path)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
      },
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
