import { type Locale, localePath, LOCALES } from "../i18n/ui";

/** Canonical post URL in its language: `/<slug>/`, `/pl/<slug>/`. */
export function postUrl(locale: Locale, slug: string): string {
  return localePath(locale, `/${slug}/`);
}

/** Plain-text (llms.txt) version of a post: `/llms/<slug>.txt`, `/pl/llms/<slug>.txt`. */
export function llmsUrl(locale: Locale, slug: string): string {
  return localePath(locale, `/llms/${slug}.txt`);
}

/**
 * Post source file, relative to src/content/blog: one folder per post, one file per
 * language (`<slug>/en.mdx`, `<slug>/pl.mdx`). Groups: 1 = folder (English slug), 2 = language.
 */
export const POST_FILE = new RegExp(`^([^/]+)/(${LOCALES.join("|")})\\.mdx?$`);
