import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "fetza_access_token";
const REFRESH_TOKEN_KEY = "fetza_refresh_token";

/** Web dev fallback only — not AsyncStorage; in-memory for this session. */
const webTokenCache: { access: string | null; refresh: string | null } = {
  access: null,
  refresh: null,
};

async function readSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return key === ACCESS_TOKEN_KEY
      ? webTokenCache.access
      : webTokenCache.refresh;
  }

  return SecureStore.getItemAsync(key);
}

async function writeSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (key === ACCESS_TOKEN_KEY) {
      webTokenCache.access = value;
    } else {
      webTokenCache.refresh = value;
    }
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    if (key === ACCESS_TOKEN_KEY) {
      webTokenCache.access = null;
    } else {
      webTokenCache.refresh = null;
    }
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function getAccessToken(): Promise<string | null> {
  return readSecureItem(ACCESS_TOKEN_KEY);
}

export async function setAccessToken(token: string): Promise<void> {
  await writeSecureItem(ACCESS_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return readSecureItem(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string): Promise<void> {
  await writeSecureItem(REFRESH_TOKEN_KEY, token);
}

export async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    deleteSecureItem(ACCESS_TOKEN_KEY),
    deleteSecureItem(REFRESH_TOKEN_KEY),
  ]);
}

export async function setAuthTokens(tokens: {
  accessToken: string;
  refreshToken?: string | null;
}): Promise<void> {
  await setAccessToken(tokens.accessToken);

  if (tokens.refreshToken) {
    await setRefreshToken(tokens.refreshToken);
  }
}
