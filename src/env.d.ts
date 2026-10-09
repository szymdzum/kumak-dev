/// <reference types="astro/client" />
/// <reference types="astro/astro-jsx" />

/** Client-side Umami helpers defined inline in Head.astro. */
interface Track {
  event: (name: string, data?: Record<string, unknown>) => void;
  codeCopy: () => void;
  articleCopy: () => void;
  share: (method: string) => void;
  social: (platform: string) => void;
  scroll: (depth: number) => void;
}

interface Window {
  track: Track;
}

declare const track: Track;
