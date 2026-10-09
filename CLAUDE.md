# CLAUDE.md

> **Context Efficiency Rule**: Keep responses short, precise, and simple. Minimize token usage while maintaining helpfulness. Avoid verbose explanations unless specifically requested.

**Kumak's Blog** - Astro blog on Deno Deploy, live at https://kumak.dev

## Tech Stack
- **Astro 7** `output: "server"` + `@deno/astro-adapter`; pages prerendered, `rss.xml`/`llms*.txt`/404 on-demand (server-side Umami tracking)
- **MDX** via `unified()` processor from `@astrojs/markdown-remark` (rehype plugins live in `markdown.processor`)
- **Node 22.12+** for npm/Astro (`.nvmrc`), **Deno 2.x** for tasks, lint, fmt, runtime
- **Deno Deploy** `szymdzum/kumak-dev` project, GitHub integration (no Actions workflows); build status visible via `gh api repos/szymdzum/kumak-dev/commits/<sha>/statuses`
- `astro.config.mjs` has a Vite plugin patching an adapter 0.6.0 static-path bug — remove when fixed upstream

## Essential Commands
```bash
deno task dev          # Dev server at localhost:4321
deno task build        # Production build
deno run -A dist/server/entry.mjs  # Run production server (port 8085)
deno task check-all    # Lint + format check
deno task fix          # Auto-fix lint and formatting
deno task knip         # Unused files/deps
git push origin main   # Deploys via Deno Deploy GitHub integration
```

## Infrastructure
- **Domains**: kumak.dev, www.kumak.dev (Cloudflare proxy)
- **Analytics**: Umami at analytics.kumak.dev (`src/utils/analytics.ts`)
- **Comments**: Giscus

## Architecture

**Structure:**
- `src/components/` - 6 components (Footer, FormattedDate, Head, Header, Hero, PostCard)
- `src/layouts/` - BaseLayout only
- `src/pages/` - 4 pages (index, about, [...slug], rss.xml)
- `src/content/blog/` - Markdown/MDX blog posts
- `src/utils/` - path.ts (navigation helpers)

**Configuration:**
- `src/site-config.ts` - Site metadata and navigation
- `src/content.config.ts` - Content collection (glob loader) + Zod schema from `astro/zod`
- Path aliases: `@components/*`, `@layouts/*`, `@utils/*`

## CSS Architecture

**Clear Responsibility Model:**
```
global.css (248 lines)     → Design tokens + reset + utilities ONLY
Component <style>          → All component presentation
BaseLayout <style>         → Page layout + prose styles
```

**Decision Tree:**
- CSS variable/token? → `global.css`
- Reset rule? → `global.css`
- Utility class? → `global.css`
- Component-specific? → Component `<style>` block
- Page layout/prose? → `BaseLayout <style is:global>`

**Rules:**
- ✅ All component styles in scoped `<style>` blocks
- ✅ Use design tokens from global.css (--space-*, --color-*, --text-*)
- ✅ Prefer element selectors in scoped styles (no class noise)
- ✅ Use `data-*` attributes for JS hooks (not classes)
- ❌ NO component styles in global.css
- ❌ NO element selectors in global (h1, nav, article)
- ❌ NO inline styles
- ❌ NO classes unless required for JS or complex selectors

**Design Tokens:**
- Spacing: `--space-xs` through `--space-3xl` (harmonic 1.25 scale)
- Typography: `--text-xs` through `--text-3xl`
- Colors: `--color-text`, `--color-primary`, `--color-bg` (dark theme support)
- Rhythm: `--rhythm-quarter`, `--rhythm-half`, `--rhythm-single`

## Development Requirements

**Pre-commit (automated):**
- Husky: `deno fmt --check` + `deno lint` (no tests)

**Standards:**
- TypeScript strict, no `any` types
- Use `src/utils/posts.ts` helpers for content queries  
- Semantic HTML, WCAG AA accessibility
- Zero legacy dependencies (EA-only)

## Hooks Configuration
- **Type Safety**: Pre/post-tool hooks reject `any` types
- **Cleanup**: Automated code cleanup via `.claude/hooks/`
- **Quality Gates**: Enforced via `.claude/settings.json`

## Documentation

**Available:**
- `CURRENT_CONFIG.md` - Complete infrastructure documentation
- `WARP.md` - Warp terminal integration guide  
- `README.md` - Project overview

**Code Style:**
- `.claude/code-guide.md` - TypeScript/Astro patterns
- Token efficient, minimal comments
