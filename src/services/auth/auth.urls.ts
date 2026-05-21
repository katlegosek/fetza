/** Path segments under `/api/mobile/v1` (see `mobileApiPath` in `@/api/client`). */
export const authUrls = {
  login: () => "/auth/login",
  logout: () => "/auth/logout",
  me: () => "/auth/me",
  refresh: () => "/auth/refresh",
} as const;
