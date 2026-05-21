/** When `"true"`, route guards and session restore are active. Default off until Rails auth ships. */
export const isAuthEnabled = (): boolean =>
  process.env.EXPO_PUBLIC_AUTH_ENABLED === "true";
