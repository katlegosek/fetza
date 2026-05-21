import { isApiError } from "@/api/errors";

/**
 * Prefer `ApiError.message`, then other `Error.message` (e.g. validation throws),
 * otherwise `fallback`.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
