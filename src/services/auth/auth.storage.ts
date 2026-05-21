/** In-memory token store until expo-secure-store is added. */
let accessToken: string | null = null;

export async function getAccessToken(): Promise<string | null> {
  // TODO(expo-secure-store): read persisted access token
  return accessToken;
}

export async function setAccessToken(token: string): Promise<void> {
  // TODO(expo-secure-store): persist access token securely
  accessToken = token;
}

export async function clearAccessToken(): Promise<void> {
  // TODO(expo-secure-store): remove persisted access token
  accessToken = null;
}
