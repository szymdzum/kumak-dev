# Feature Roadmap

Analysis of potential blog features, prioritized by impact and effort.

## Current Strengths

| Feature | Status |
|---------|--------|
| SEO (Schema.org, OG, RSS, Sitemap) | Excellent |
| Accessibility (WCAG AA) | Excellent |
| Performance (static, prefetch, lazy) | Excellent |
| Comments (Giscus) | Good |
| LLM visibility (llms.txt, llms-full.txt, per-post .txt) | Good |
| Analytics (Umami, client + server-side) | Good |
| Social sharing (ShareButton, copy page) | Good |
| Code experience (copy, syntax) | Good |
| Design system (CSS variables) | Solid |

## Recommended Features

### Tier 1: High Impact, Low Effort

| Feature | Why | Effort |
|---------|-----|--------|
| **Reading Progress Bar** | Visual engagement (TOC already shows progress) | ~1hr |
| **Category Pages** | `/category/[slug]` archives, improves discoverability | ~3hr |

### Tier 2: High Impact, Medium Effort

| Feature | Why | Effort |
|---------|-----|--------|
| **Search (Pagefind)** | Static search, no backend, great for Astro | ~4hr |
| **Post Series** | Group related posts (e.g., "AI Agents" series) | ~4hr |
| **Tag Pages** | `/tag/[slug]` for topic browsing | ~3hr |

### Tier 3: Engagement & Growth

| Feature | Why | Effort |
|---------|-----|--------|
| **Newsletter** (Buttondown/Resend) | Build audience, email is still king | ~4hr |
| **View Count** | Social proof, can use simple KV store on Deno Deploy | ~3hr |
| **Reactions** (beyond Giscus) | Quick feedback without commenting | ~4hr |
| **Reading List/Bookmarks** | Let users save posts (localStorage) | ~3hr |

### Tier 4: Advanced SEO & AI Visibility

| Feature | Why | Effort |
|---------|-----|--------|
| **BreadcrumbList Schema** | Improves SERP appearance | ~1hr |
| **FAQ Schema** | If you add FAQ sections to posts | ~2hr |
| **Category RSS Feeds** | `/category/philosophy/rss.xml` for niche subscribers | ~2hr |

## Top Priorities

### 1. Reading Progress Bar
Sticky bar at top showing scroll progress. Minimal JS, high visual impact.

### 2. Search with Pagefind
Static search index built at compile time. Zero runtime cost.
Perfect for static Astro sites. Better UX than browser find.

**Resources:**
- https://pagefind.app/
- https://docs.astro.build/en/guides/integrations-guide/pagefind/

### 3. Category Archive Pages
`/category/philosophy` lists all philosophy posts.
Improves navigation, SEO, and content discoverability.

### 4. Post Series Support
Add `series: z.string().optional()` to schema.
Render "Part 2 of AI Agents series" with prev/next navigation.

## Features to Skip

| Feature | Why Skip |
|---------|----------|
| Dark/Light Toggle | Terminal aesthetic is intentional |
| Multiple Authors | Solo blog, unnecessary complexity |
| Heavy Animations | Against minimalist ethos |
| AI Chat | Gimmicky, not aligned with content focus |

## Implementation Plan

```
Week 1: Reading progress bar
Week 2: Category pages + Tag pages
Week 3: Pagefind search
Week 4: Post series + Newsletter signup
```

## Technical Notes

### Existing Schema Fields (Partly Used)
From `src/content.config.ts`:
- `tags: z.array(z.string()).default([])` - only emitted as `article:tag` meta; no tag pages exist

### Pagefind Integration
```bash
# Install
deno add npm:@pagefind/default-ui

# Add to astro.config.mjs
import pagefind from '@pagefind/astro';
```

### Category Pages Structure
```
src/pages/category/[category].astro
```
Use `getStaticPaths()` with category enum from schema.

## Sources

- https://bloggingplatforms.app/blog/best-blogging-platforms-for-developers
- https://www.positional.com/blog/structured-data-seo
- https://wizishop.com/blog/structured-data-seo
- https://content-whale.com/blog/best-seo-practices-2024/
- https://pagefind.app/
