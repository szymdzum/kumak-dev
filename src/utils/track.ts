/**
 * Client-side Umami events. The Umami script (loaded in Head) defines `umami`
 * once ready; events fired before that, or with analytics blocked, are dropped.
 */
declare global {
  var umami: { track(name: string, data?: Record<string, unknown>): void } | undefined;
}

// Every event carries the page language (<html lang>), so EN and PL can be compared.
function event(name: string, data?: Record<string, unknown>): void {
  globalThis.umami?.track(name, { ...data, lang: document.documentElement.lang });
}

export const track = {
  codeCopy: () => event("code-copy", { path: location.pathname }),
  articleCopy: () => event("article-copy", { path: location.pathname }),
  share: (method: string) => event("share", { method, path: location.pathname }),
  social: (platform: string) => event("social-click", { platform }),
  scroll: (depth: number) => event("scroll-depth", { depth, path: location.pathname }),
};
