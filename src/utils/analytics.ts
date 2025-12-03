const UMAMI_URL = import.meta.env.UMAMI_URL ?? "https://analytics.kumak.dev";
const WEBSITE_ID = import.meta.env.UMAMI_WEBSITE_ID ?? "9a78de62-6e9d-4d7b-8e0c-998a85550282";
const SITE_ORIGIN = "https://kumak.dev";

interface TrackEventOptions {
  url: string;
  userAgent?: string;
  referrer?: string;
}

/**
 * Tracks a custom event in Umami Analytics (server-side).
 * Fire-and-forget: does not block the response.
 *
 * Note: Umami v3 requires Origin header and browser-like User-Agent
 * to pass bot detection. The actual client User-Agent is stored in
 * event data for analysis.
 */
export function trackLlmsRequest(options: TrackEventOptions): void {
  const { url, userAgent, referrer } = options;

  const payload = {
    type: "event",
    payload: {
      website: WEBSITE_ID,
      hostname: "kumak.dev",
      url,
      title: "LLMs.txt",
      screen: "1920x1080",
      language: "en-US",
      referrer: "",
      name: "llms-request",
      data: {
        agent: userAgent ?? "unknown",
        source: referrer ?? "direct",
      },
    },
  };

  fetch(`${UMAMI_URL}/api/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": SITE_ORIGIN,
      "User-Agent": "Mozilla/5.0 (compatible; KumakAnalytics/1.0)",
    },
    body: JSON.stringify(payload),
  }).catch((error: unknown) => {
    if (import.meta.env.DEV) {
      console.warn("Analytics error:", error);
    }
  });
}
