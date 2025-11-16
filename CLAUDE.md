# CLAUDE.md

> **Context Efficiency Rule**: Keep responses short, precise, and simple. Minimize token usage while maintaining helpfulness. Avoid verbose explanations unless specifically requested.

**Kumak's Blog** - Astro static blog on Deno Deploy Early Access, live at https://kumak.dev

## Tech Stack
- **Astro 5.13.7** static output, MDX integration
- **Deno 2.x** runtime (JSR packages only)
- **Deno Deploy EA** - `devblog` project, 6 regions, 9ms latency
- **GitHub Actions** CI/CD with quality gates

## Essential Commands
```bash
# Development
deno task dev          # Start dev server at localhost:4321
deno task build        # Build for production
deno task preview      # Preview production build

# Quality Assurance  
deno task check-all    # Astro check + lint + format
deno task test         # Run tests
deno task fix          # Auto-fix linting and formatting

# Deployment (EA integrated)
git push origin main   # Auto-deploy via GitHub Actions
```

## Infrastructure

**Deployment:**
- **EA Project**: `devblog` on console.deno.com
- **Domains**: kumak.dev, www.kumak.dev (Cloudflare proxy)
- **SSL**: Let's Encrypt auto-renewal via EA
- **Pipeline**: GitHub Actions → EA build → 6 regions
- **Performance**: 0.00% error rate, <2min total deployment

## Architecture

**Structure:**
- `src/components/` - 6 components (Footer, FormattedDate, Head, Header, Hero, PostCard)
- `src/layouts/` - BaseLayout only
- `src/pages/` - 4 pages (index, about, [...slug], rss.xml)
- `src/content/blog/` - Markdown/MDX blog posts
- `src/utils/` - path.ts (navigation helpers)

**Configuration:**
- `src/site-config.ts` - Site metadata and navigation
- `src/content/config.ts` - Content schemas with Zod
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
- ❌ NO component styles in global.css
- ❌ NO element selectors in global (h1, nav, article)
- ❌ NO inline styles

**Design Tokens:**
- Spacing: `--space-xs` through `--space-3xl` (harmonic 1.25 scale)
- Typography: `--text-xs` through `--text-3xl`
- Colors: `--color-text`, `--color-primary`, `--color-bg` (dark theme support)
- Rhythm: `--rhythm-quarter`, `--rhythm-half`, `--rhythm-single`

## Development Requirements

**Pre-commit (automated):**
- Format check, lint (79 rules), tests (2/2 passing)
- TypeScript validation, build verification
- Auto-triggered on commit, blocks if failing

**Standards:**
- TypeScript strict, no `any` types
- Use `PostsManager` for content queries  
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
