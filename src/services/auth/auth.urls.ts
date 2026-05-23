const baseUrl = "/api/mobile/v1/auth";

export default {
  login: () => `${baseUrl}/login`,
  logout: () => `${baseUrl}/logout`,
  me: () => `${baseUrl}/me`,
  refresh: () => `${baseUrl}/refresh`,
};
