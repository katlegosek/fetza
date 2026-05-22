/**
 * Mobile auth (Doorkeeper bearer tokens).
 * - Enabled by default in development.
 * - Set EXPO_PUBLIC_AUTH_ENABLED=false to bypass guards (legacy bill flow without login).
 * - Set EXPO_PUBLIC_AUTH_ENABLED=true in production builds.
 */
export const isAuthEnabled = (): boolean => {
  const flag = process.env.EXPO_PUBLIC_AUTH_ENABLED;

  if (flag === "false") {
    return false;
  }

  if (flag === "true") {
    return true;
  }

  return __DEV__;
};
