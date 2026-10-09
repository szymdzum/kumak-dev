# CLAUDE.md

> **Context Efficiency Rule**: Keep responses short, precise, and simple. Minimize token usage while maintaining helpfulness. Avoid verbose explanations unless specifically requested.

**Kumak's Blog** - Astro blog on Deno Deploy, live at https://kumak.dev

## Tech Stack
- **Astro 7** `output: "server"` + `@deno/astro-adapter`; pages prerendered, `rss.xml`/`llms*.txt`/404 on-demand (server-side Umami tracking)
- **MDX** via `unified()` processor from `@astrojs/markdown-remark` (rehype plugins live in `markdown.processor`)
- **Node 22.12+** for npm/Astro (`.nvmrc`), **Deno 2.x** for tasks, lint, fmt, runtime
- **Deno Deploy** `szymdzum/kumak-dev` project, GitHub integration builds and deploys; build status via `gh api repos/szymdzum/kumak-dev/commits/<sha>/statuses`
- **GitHub Actions** `.github/workflows/check.yml` runs `check-all` + `build` on PRs and `main` (no deploy step)

## Essential Commands
```bash
deno task dev          # Dev server at localhost:4321
deno task build        # Production build
deno run -A dist/server/entry.mjs  # Run production server (port 8085)
deno task check-all    # Lint + format check + astro check
deno task fix          # Auto-fix lint and formatting
deno task knip         # Unused files/deps
git push origin main   # Deploys via Deno Deploy GitHub integration
```
No test suite.

## Infrastructure
- **Domains**: kumak.dev, www.kumak.dev (Cloudflare proxy)
- **Analytics**: Umami at analytics.kumak.dev (`siteConfig.umami`). Client script + `window.track` in `Head.astro`; server events in `src/utils/analytics.ts` (skip prefetch requests; internal links to tracked endpoints use `data-astro-prefetch="false"`). Optional `UMAMI_URL` env override.
- **Comments**: Giscus (`siteConfig.giscus`)

## Architecture
- `src/components/` - Astro components (NavBar, Footer, Head, SchemaOrg, Hero, BlogPostCard, ArticleMeta, ArticleFooter, TableOfContents, TldrBox, CodeBlock, CopyPageButton, ShareButton, LlmsTxt*, Giscus, ScrollDepthTracker, ...)
- `src/layouts/BaseLayout.astro` - Only layout
- `src/pages/` - index, about, `[...slug]`, 404, `rss.xml.ts`, `llms.txt.ts`, `llms-full.txt.ts`, `llms/[slug].txt.ts`
- `src/content/blog/` - MDX posts (file name = slug)
- `src/utils/` - analytics, links (external-link rehype plugin), llms, path, posts, toc
- `src/styles/` - `global.css`, `prose.css`
- `astro.config.mjs` - Vite plugin patching `@deno/astro-adapter` 0.6.0 (remove when fixed upstream); sitemap `lastmod` from post frontmatter

**Configuration:**
- `src/site-config.ts` - Site metadata, `author: { name, handle }`, socials, Umami, Giscus
- `src/content.config.ts` - Content collection (glob loader) + Zod schema from `astro/zod` (incl. `keywords`, `showToc` default `true`)
- Path aliases (`deno.json` + `tsconfig.json`): `@components/*`, `@layouts/*`, `@utils/*`, `@styles/*`, `@/*`, `@site-config`
- Post frontmatter/writing style: `.claude/blog-style.md`

## CSS Architecture
```
src/styles/global.css  → Design tokens + reset + utilities (imported in Head.astro)
src/styles/prose.css   → Article/prose styles (imported in BaseLayout)
Component <style>      → All component presentation
```

**Rules:**
- All component styles in scoped `<style>` blocks; no component styles in global.css
- Use design tokens; no magic numbers, no inline styles
- Prefer element selectors in scoped styles; classes only when required
- `data-*` attributes for JS hooks (e.g. `data-share`, `data-toc`, `data-codeblock-copy`), not classes

**Design Tokens (global.css):**
- Spacing: `--space-3xs` … `--space-3xl`
- Typography: `--text-xs` … `--text-3xl`
- Colors: `--color-text*`, `--color-bg*`, `--color-border*`, `--color-primary*`, `--color-accent*` (dark theme support)
- Rhythm: `--rhythm-quarter` … `--rhythm-2-5x`

## Development Requirements
- **Pre-commit** (Husky): `deno fmt --check`, `deno lint`, `deno task typecheck` (astro check; uses `.nvmrc` Node if nvm present)
- **CI**: same checks + build
- TypeScript strict, no `any` (`no-explicit-any` lint rule + astro check)
- Use `src/utils/posts.ts` (`getAllPosts`) for content queries
- Semantic HTML, WCAG AA accessibility

## Documentation
- `README.md` - Project overview
- `.claude/blog-style.md` - Post writing style and frontmatter
- `docs/FEATURES.md` - Feature ideas/roadmap
