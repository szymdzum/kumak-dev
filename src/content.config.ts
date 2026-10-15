import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { POST_FILE } from "./utils/path";

function postId({ entry }: { entry: string }): string {
  if (!POST_FILE.test(entry)) {
    throw new Error(`src/content/blog/${entry}: posts must be <slug>/en.mdx`);
  }
  return entry.replace(/\.mdx?$/, ""); // "<slug>/en"
}

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog", generateId: postId }),
  schema: z.object({
    title: z.string(),
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
