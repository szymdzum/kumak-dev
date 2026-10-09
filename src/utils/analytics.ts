const UMAMI_URL = import.meta.env.UMAMI_URL ?? "https://analytics.kumak.dev";
const WEBSITE_ID = import.meta.env.UMAMI_WEBSITE_ID ?? "9a78de62-6e9d-4d7b-8e0c-998a85550282";
const SITE_ORIGIN = "https://kumak.dev";
const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface TrackEventOptions {
  eventName: string;
  url: string;
  title: string;
  userAgent?: string | undefined;
  referrer?: string | undefined;
}

/**
 * Tracks a custom event in Umami Analytics (server-side).
 * Fire-and-forget: does not block the response.
 *
 * Note: Umami v3 requires Origin header and browser-like User-Agent
 * to pass bot detection. The actual client User-Agent is stored in
 * event data for analysis.
 */
export function trackEvent(options: TrackEventOptions): void {
  const { eventName, url, title, userAgent, referrer } = options;

  const payload = {
    type: "event",
    payload: {
      website: WEBSITE_ID,
      hostname: "kumak.dev",
      url,
      title,
      screen: "1920x1080",
      language: "en-US",
      referrer: "",
      name: eventName,
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
      "User-Agent": BROWSER_UA,
    },
    body: JSON.stringify(payload),
  }).catch((error: unknown) => {
    if (import.meta.env.DEV) {
      console.warn("Analytics error:", error);
    }
  });
}

/**
 * Browser prefetches (e.g. Astro's prefetch) are not real reads.
 * Chromium sends `Sec-Purpose: prefetch`; older browsers send `Purpose: prefetch`.
 */
function isPrefetch(request: Request): boolean {
  const purpose = request.headers.get("sec-purpose") ?? request.headers.get("purpose") ?? "";
  return purpose.includes("prefetch");
}

function trackRequest(request: Request, eventName: string, title: string, url: string): void {
  if (isPrefetch(request)) return;
  trackEvent({
    eventName,
    title,
    url,
    userAgent: request.headers.get("user-agent") ?? undefined,
    referrer: request.headers.get("referer") ?? undefined,
  });
}

export function trackLlmsRequest(request: Request, url: string): void {
  trackRequest(request, "llms-request", "LLMs.txt", url);
}

export function trackRssRequest(request: Request): void {
  trackRequest(request, "rss-fetch", "RSS Feed", "/rss.xml");
}
