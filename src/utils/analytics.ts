import { siteConfig } from "@/site-config";

const SITE_HOSTNAME = new URL(siteConfig.url).hostname;

// UMAMI_URL override lets local builds point events at a test endpoint
const UMAMI_URL = import.meta.env.UMAMI_URL ?? siteConfig.umami.url;
const WEBSITE_ID = siteConfig.umami.websiteId;
const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Upper bound on how long a response may wait for Umami. */
const TRACK_TIMEOUT_MS = 1500;

/**
 * Browser prefetches (e.g. Astro's prefetch) are not real reads.
 * Chromium sends `Sec-Purpose: prefetch`; older browsers send `Purpose: prefetch`.
 */
function isPrefetch(request: Request): boolean {
  const purpose = request.headers.get("sec-purpose") ?? request.headers.get("purpose") ?? "";
  return purpose.includes("prefetch");
}

/**
 * Tracks a custom event in Umami Analytics (server-side).
 *
 * Returns a promise that never rejects. Callers start it early and await it
 * right before returning the response: Deno Deploy may stop the isolate once
 * the response is sent, so an unawaited fetch is not guaranteed to finish.
 *
 * Note: Umami v3 requires Origin header and browser-like User-Agent
 * to pass bot detection. The actual client User-Agent is stored in
 * event data for analysis.
 */
async function trackRequest(
  request: Request,
  eventName: string,
  title: string,
  url: string,
): Promise<void> {
  if (isPrefetch(request)) return;

  const payload = {
    type: "event",
    payload: {
      website: WEBSITE_ID,
      hostname: SITE_HOSTNAME,
      url,
      title,
      screen: "1920x1080",
      language: "en-US",
      referrer: "",
      name: eventName,
      data: {
        agent: request.headers.get("user-agent") ?? "unknown",
        source: request.headers.get("referer") ?? "direct",
      },
    },
  };

  try {
    await fetch(`${UMAMI_URL}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": siteConfig.url,
        "User-Agent": BROWSER_UA,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TRACK_TIMEOUT_MS),
    });
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.warn("Analytics error:", error);
    }
  }
}

export function trackLlmsRequest(request: Request, url: string): Promise<void> {
  return trackRequest(request, "llms-request", "LLMs.txt", url);
}

export function trackRssRequest(request: Request): Promise<void> {
  return trackRequest(request, "rss-fetch", "RSS Feed", "/rss.xml");
}

const MAX_404_PATH_LENGTH = 200;
// Vulnerability scanners probing for dotfiles, PHP/WordPress, CGI and admin panels
const SCANNER_PATH = /(^|\/)\.|\.php\b|wp-|cgi-bin|phpmyadmin/i;
const BOT_UA = /bot|crawl|spider|slurp|curl|wget|python|go-http|scan/i;

export async function track404Request(request: Request, pathname: string): Promise<void> {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (SCANNER_PATH.test(pathname) || BOT_UA.test(userAgent)) return;
  await trackRequest(
    request,
    "404-not-found",
    "404 Not Found",
    pathname.slice(0, MAX_404_PATH_LENGTH),
  );
}
