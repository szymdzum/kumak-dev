import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { POST_FILE } from "./utils/path";
import { DEFAULT_LOCALE, LOCALES } from "./i18n/ui";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Id "<folder>/<lang>". The folder is the English slug and pairs translations; a translation
 * must set its own `slug` (its URL), the English file must not (its URL is the folder).
 */
function postId({ entry, data }: { entry: string; data: Record<string, unknown> }): string {
  const file = `src/content/blog/${entry}`;
  const match = POST_FILE.exec(entry);
  if (!match) {
    throw new Error(`${file}: posts must be <slug>/<lang>.mdx (${LOCALES.join(" or ")})`);
  }
  const [, folder = "", lang] = match;
  if (!SLUG.test(folder)) {
    throw new Error(`${file}: the folder name is the English URL, use lowercase and hyphens`);
  }
  const isDefault = lang === DEFAULT_LOCALE;
  if (isDefault && data["slug"] !== undefined) {
    throw new Error(`${file}: remove \`slug\`, the English URL is the folder name`);
  }
  if (!isDefault && !(typeof data["slug"] === "string" && SLUG.test(data["slug"]))) {
    throw new Error(`${file}: set \`slug\` to the translated URL slug (lowercase, hyphenated)`);
  }
  return entry.replace(/\.mdx?$/, "");
}

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog", generateId: postId }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(), // translations only, validated in postId
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),

    draft: z.boolean().default(false),
    category: z.enum(["tutorial", "opinion", "project", "philosophy"]),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).optional(),
    showToc: z.boolean().default(true),
    externalLinks: z.array(z.object({
      title: z.string(),
      url: z.string(),
    })).optional(),
  }),
});

export const collections = { blog };
