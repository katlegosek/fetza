import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/api/api-error-message";

const DEFAULT_DISMISS_MS = 4000;

/**
 * Inline mutation error banner: maps failures via {@link getApiErrorMessage} and
 * auto-clears after a short delay.
 */
export function useMutationErrorBanner(
  fallbackMessage: string,
  dismissMs = DEFAULT_DISMISS_MS,
) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = setTimeout(() => setMessage(null), dismissMs);
    return () => clearTimeout(timeout);
  }, [dismissMs, message]);

  const showError = useCallback(
    (error: unknown) => {
      setMessage(getApiErrorMessage(error, fallbackMessage));
    },
    [fallbackMessage],
  );

  return {
    message,
    setMessage,
    showError,
  };
}
