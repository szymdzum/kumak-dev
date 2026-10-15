/** Canonical post URL: leading and trailing slash. */
export function postUrl(slug: string): string {
  return `/${slug}/`;
}

/** Plain-text (llms.txt) version of a post. */
export function llmsUrl(slug: string): string {
  return `/llms/${slug}.txt`;
}

/**
 * Post source file, relative to src/content/blog: one folder per post, one file per
 * language (`<slug>/en.mdx`). Groups: 1 = slug (folder name), 2 = language.
 */
export const POST_FILE = /^([^/]+)\/(en)\.mdx?$/;
