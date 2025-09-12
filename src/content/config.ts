import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),

    // New fields for enhanced features
    draft: z.boolean().default(false),
    category: z.enum(['tutorial', 'opinion', 'project', 'philosophy']),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).optional(), // SEO keywords
    author: z.string().default('Szymon Dzumak'),
    showToc: z.boolean().default(false), // Table of contents
    featured: z.boolean().default(false), // Featured post
    minutesToRead: z.number().optional(), // Will be calculated
    relatedPosts: z.array(z.string()).optional(), // Manual related posts
    externalLinks: z.array(z.object({
      title: z.string(),
      url: z.string(),
    })).optional(),
  }),
})

export const collections = { blog }
