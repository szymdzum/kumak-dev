import { type CollectionEntry, getCollection } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

const WORDS_PER_MINUTE = 200;

function sortByDateDescending(a: BlogPost, b: BlogPost): number {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog", ({ data }: BlogPost) => {
    return import.meta.env.DEV || !data.draft;
  });
  return posts.sort(sortByDateDescending);
}

/** YYYY-MM-DD in UTC (frontmatter dates are UTC midnight). */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function estimateReadingTime(content: string): number {
  return Math.ceil(countWords(content) / WORDS_PER_MINUTE);
}
