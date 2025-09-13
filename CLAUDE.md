# CLAUDE.md

> **Context Efficiency Rule**: Keep responses short, precise, and simple. Minimize token usage while maintaining helpfulness. Avoid verbose explanations unless specifically requested.

**Kumak's Blog** - Astro-based personal blog with Deno runtime, emphasizing simplicity, performance, and content-focused design.

## Tech Stack
- **Astro 5.x** with static output mode
- **Deno runtime** (no Node.js dependencies)
- **Content Collections** with Zod validation
- **Deno Deploy** via GitHub Actions

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

# Deployment
deno task deploy       # Build and deploy to Deno Deploy
```

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

**Before committing:**
```bash
deno task check-all && deno task test
```

**Standards:**
- TypeScript strict mode (no `any` types)
- Semantic HTML and WCAG AA accessibility
- Use `PostsManager` for content operations
- Follow existing component patterns
- Preserve minimal aesthetic

## MCP Context Servers Available
- **Astro docs**: Use `mcp__astro_docs__*` tools when you need Astro documentation references
  - Configured in `~/.claude/settings.json` 
  - Provides access to official Astro documentation
  - Restart Claude Code to activate new MCP servers

## Code Style Guide

See [@.claude/code-guide.md](.claude/code-guide.md) for detailed conventions:
- TypeScript and Astro patterns
- CSS architecture and design tokens  
- Testing and documentation standards
- Performance and accessibility guidelines