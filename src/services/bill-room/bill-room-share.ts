export type GuestShareLinkResult =
  | { url: string; error: null }
  | { url: null; error: string };

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export function resolveGuestShareLink({
  shareUrl,
  shareToken,
}: {
  shareUrl: string | null;
  shareToken: string | null;
}): GuestShareLinkResult {
  if (shareUrl) {
    if (isHttpUrl(shareUrl)) {
      return { url: shareUrl, error: null };
    }

    return {
      url: null,
      error: "The bill room returned an invalid guest link.",
    };
  }

  if (!shareToken) {
    return {
      url: null,
      error: "The guest link is still being prepared. Refresh the bill room.",
    };
  }

  const configuredOrigin = process.env.EXPO_PUBLIC_WEB_APP_URL?.trim();
  if (!configuredOrigin) {
    return {
      url: null,
      error: "The guest web URL is not configured for this build.",
    };
  }

  if (!isHttpUrl(configuredOrigin)) {
    return {
      url: null,
      error: "The configured guest web URL must use HTTP or HTTPS.",
    };
  }

  const baseUrl = new URL(configuredOrigin);
  baseUrl.pathname = `/b/${encodeURIComponent(shareToken)}`;
  baseUrl.search = "";
  baseUrl.hash = "";

  return { url: baseUrl.toString(), error: null };
}

export function guestShareMessage(url: string): string {
  return `Join my Fetza bill room and claim your items: ${url}`;
}
