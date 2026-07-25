const tokenCache = new Map<string, string>();
const keyFor = (shareToken: string) => `fetza_guest_token_${shareToken}`;

export function getGuestToken(shareToken: string): string | null {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem(keyFor(shareToken));
  }

  return tokenCache.get(shareToken) ?? null;
}

export function setGuestToken(shareToken: string, token: string): void {
  tokenCache.set(shareToken, token);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(keyFor(shareToken), token);
  }
}

export function clearGuestToken(shareToken: string): void {
  tokenCache.delete(shareToken);
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(keyFor(shareToken));
  }
}
