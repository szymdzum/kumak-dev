import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
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
    author: z.string().default("Szymon Dzumak"),
    showToc: z.boolean().default(false),
    featured: z.boolean().default(false),
    minutesToRead: z.number().optional(),
    relatedPosts: z.array(z.string()).optional(),
    externalLinks: z.array(z.object({
      title: z.string(),
      url: z.string(),
    })).optional(),
  }),
});

export const collections = { blog };
