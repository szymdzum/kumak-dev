import { type CollectionEntry, getCollection } from "astro:content";
import { DEFAULT_LOCALE, type Locale, LOCALES, toLocale, type Translations } from "@/i18n/ui";
import { llmsUrl, postUrl } from "./path";

export type BlogPost = CollectionEntry<"blog">;

const WORDS_PER_MINUTE = 200;

function sortByDateDescending(a: BlogPost, b: BlogPost): number {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

// Ids are "<folder>/<lang>" (see content.config.ts).
function postFolder(post: BlogPost): string {
  return post.id.split("/")[0];
}

export function postLocale(post: BlogPost): Locale {
  return toLocale(post.id.split("/")[1]);
}

/** URL slug: the folder name for English, the `slug` field for translations. */
export function postSlug(post: BlogPost): string {
  return post.data.slug ?? postFolder(post);
}

/** The post's canonical path, with its language prefix. */
export function postPath(post: BlogPost): string {
  return postUrl(postLocale(post), postSlug(post));
}

/** The post's plain-text (llms.txt) path, with its language prefix. */
export function postLlmsPath(post: BlogPost): string {
  return llmsUrl(postLocale(post), postSlug(post));
}

// First path segments taken by pages in every language: about, llms and the locale prefixes.
const RESERVED_SLUGS = new Set<string>(["about", "llms", ...LOCALES]);

/** Fails the build when two posts (drafts included) would share a URL, or a post a static route's. */
function assertUniqueUrls(posts: BlogPost[]): void {
  const seen = new Map<string, string>();
  for (const post of posts) {
    const path = postPath(post);
    if (RESERVED_SLUGS.has(postSlug(post))) {
      throw new Error(`${post.filePath}: slug "${postSlug(post)}" is used by a page`);
    }
    const other = seen.get(path);
    if (other) throw new Error(`${post.filePath} and ${other} both use ${path}`);
    seen.set(path, post.filePath ?? post.id);
  }
}

function published(posts: BlogPost[]): BlogPost[] {
  return posts
    .filter((post) => import.meta.env.DEV || !post.data.draft)
    .sort(sortByDateDescending);
}

/** Posts in one language, from a list in all languages. */
export function inLocale(posts: BlogPost[], locale: Locale): BlogPost[] {
  return posts.filter((post) => postLocale(post) === locale);
}

/** Published posts in every language, newest first. */
export async function getPostsInAllLocales(): Promise<BlogPost[]> {
  return published(await getCollection("blog"));
}

/** Published posts in one language (English by default), newest first. */
export async function getAllPosts(locale: Locale = DEFAULT_LOCALE): Promise<BlogPost[]> {
  return inLocale(await getPostsInAllLocales(), locale);
}

/**
 * getStaticPaths for a language's post route: one page per post, with its translations.
 * Also checks every post's URL (drafts included) once per build.
 */
export async function postStaticPaths(locale: Locale) {
  const entries: BlogPost[] = await getCollection("blog");
  assertUniqueUrls(entries);
  const allPosts = published(entries);
  return inLocale(allPosts, locale).map((post) => ({
    params: { slug: postSlug(post) },
    props: { post, translations: postTranslations(post, allPosts) },
  }));
}

/** Paths of every language version of a post (itself included), paired by folder. */
function postTranslations(post: BlogPost, allPosts: BlogPost[]): Translations {
  return Object.fromEntries(
    allPosts
      .filter((other) => postFolder(other) === postFolder(post))
      .map((other) => [postLocale(other), postPath(other)]),
  );
}

/**
 * Posts with no version in `locale`, so a listing can offer them in their own language.
 * (With two languages each such folder has exactly one post.)
 */
export function untranslatedPosts(locale: Locale, allPosts: BlogPost[]): BlogPost[] {
  const translated = new Set(
    allPosts.filter((post) => postLocale(post) === locale).map(postFolder),
  );
  return allPosts.filter((post) => !translated.has(postFolder(post)));
}

/** YYYY-MM-DD in UTC (frontmatter dates are UTC midnight). */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function estimateReadingTime(content: string): number {
  return Math.ceil(countWords(content) / WORDS_PER_MINUTE);
}
