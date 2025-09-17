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
- `src/components/` - Reusable UI components
- `src/layouts/` - Page layout templates  
- `src/pages/` - File-based routing
- `src/content/blog/` - Markdown/MDX blog posts
- `src/utils/postSorter.ts` - PostsManager utility

**Configuration:**
- `src/site-config.ts` - Site metadata and navigation
- `src/content/config.ts` - Content schemas with Zod
- Path aliases: `@components/*`, `@layouts/*`, `@utils/*`, `@styles/*`

## Key Utilities

**PostsManager** - Content query utility:
```typescript
const posts = new PostsManager(allPosts)
  .filter('featured')
  .sort('date-desc')
  .limit(3)
  .get()
```

**Design System:**
- CSS design tokens in `src/styles/variables.css`
- Modular CSS architecture
- Container-aware responsive units

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

## MCP Context Servers Available
- **Astro docs**: Use `mcp__astro_docs__*` tools when you need Astro documentation references
  - Configured in `~/.claude/settings.json` 
  - Provides access to official Astro documentation
  - Restart Claude Code to activate new MCP servers

## Documentation

**Current Setup:**
- `CURRENT_CONFIG.md` - Complete infrastructure documentation
- `DEPLOY_EA_MIGRATION.md` - EA migration guide
- `OPTIMIZATION_REPORT.md` - Performance analysis

**Code Style:**
- `.claude/code-guide.md` - TypeScript/Astro patterns
- Token efficient, minimal comments
