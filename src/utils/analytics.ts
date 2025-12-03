const UMAMI_URL = import.meta.env.UMAMI_URL ?? "https://analytics.kumak.dev";
const WEBSITE_ID = import.meta.env.UMAMI_WEBSITE_ID ?? "9a78de62-6e9d-4d7b-8e0c-998a85550282";

interface TrackEventOptions {
  url: string;
  userAgent?: string;
  referrer?: string;
}

/**
 * Tracks a custom event in Umami Analytics (server-side).
 * Fire-and-forget: does not block the response.
 */
export function trackLlmsRequest(options: TrackEventOptions): void {
  const { url, userAgent, referrer } = options;

  const payload = {
    type: "event",
    payload: {
      hostname: "kumak.dev",
      url,
      website: WEBSITE_ID,
      name: "llms-request",
      data: {
        userAgent: userAgent ?? "unknown",
        referrer: referrer ?? "direct",
      },
    },
  };

  fetch(`${UMAMI_URL}/api/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((error: unknown) => {
    if (import.meta.env.DEV) {
      console.warn("Analytics error:", error);
    }
  });
}
