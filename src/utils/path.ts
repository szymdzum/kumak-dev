/** Canonical post URL: leading and trailing slash. */
export function postUrl(slug: string): string {
  return `/${slug}/`;
}

/** Plain-text (llms.txt) version of a post. */
export function llmsUrl(slug: string): string {
  return `/llms/${slug}.txt`;
}
