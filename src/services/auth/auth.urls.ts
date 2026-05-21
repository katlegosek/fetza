const baseUrl = "/api/mobile/v1/auth";

const authUrls = {
  login: () => `${baseUrl}/login`,
  logout: () => `${baseUrl}/logout`,
  me: () => `${baseUrl}/me`,
  refresh: () => `${baseUrl}/refresh`,
} as const;

export default authUrls;
