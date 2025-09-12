# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Kumak's Blog** is an Astro-based personal blog with Deno runtime, featuring minimal styling and modern web standards. The architecture emphasizes simplicity, performance, and content-focused design.

### Core Tech Stack
- **Astro 5.x** with static output mode
- **Pure Deno runtime** (no Node.js dependencies)  
- **Content Collections** with Zod schemas for type safety
- **Deno Deploy** via GitHub Actions

### Essential Commands
```bash
# Development
deno task dev          # Start dev server at localhost:4321
deno task build        # Build static site for production
deno task preview      # Preview production build locally with network URLs

# Quality Assurance
deno task test         # Run tests
deno task lint         # Lint code with Deno
deno task format       # Format code with Deno
deno task check        # Run lint + format together
deno task check-all    # Full Astro check + lint + format
deno task fix          # Auto-fix linting issues and format code

# Deployment
deno task deploy       # Build and deploy to Deno Deploy (devblog project)
deno task deploy-cli   # Install deployctl and deploy
```

### Key Architecture Patterns

**Component Organization:**
- `src/components/` - Reusable UI components (.astro files)
- `src/layouts/` - Page layout templates (Layout.astro, BlogPost.astro, About.astro)
- `src/pages/` - File-based routing (index, blog, about, projects)

**Content Management:**
- `src/content/blog/` - Blog posts with frontmatter (supports both .md and .mdx)
- `src/content/config.ts` - Content collection schemas with Zod validation
- `src/utils/postSorter.ts` - PostsManager class for content operations

**Configuration:**
- `src/site-config.ts` - Centralized site metadata and navigation
- Path aliases defined in deno.json: `@components/*`, `@layouts/*`, `@utils/*`, `@styles/*`

### PostsManager Utility

The `PostsManager` class provides a fluent API for content operations:

```typescript
// Example usage for filtering and sorting posts
const posts = new PostsManager(allPosts)
  .filter('featured')
  .sort('date-desc')
  .limit(3)
  .get();
```

### Content Structure

Blog posts support:
- Hero images (`heroImage` in frontmatter)
- Publication and update dates
- Description and title metadata  
- Tags and categories
- MDX for interactive content

### Build Configuration

- **Output**: Static site generation (not SSR)
- **Build target**: `dist/` directory with static files
- **Integrations**: MDX and sitemap support
- **Image service**: Noop service (no image optimization)

### Deployment Configuration

- **Platform**: Deno Deploy
- **Project**: `devblog` 
- **Domain**: `kumak.dev`
- **Entrypoint**: Static file server via `jsr:@std/http/file-server`
- **CI/CD**: GitHub Actions workflow for automatic deployment

### Styling Architecture

- **CSS**: Modern CSS with design tokens in `src/styles/`
- **Structure**: Modular CSS files (reset, variables, typography, layout, main)
- **Approach**: Minimal styling focused on typography and readability

### Quality Standards

- **TypeScript**: Strict mode with comprehensive compiler options
- **Linting**: Extensive ruleset (60+ rules) including `no-any`, `no-unused-vars`
- **Formatting**: Consistent style with 120-character line width, single quotes
- **Testing**: Minimal test coverage focused on routing

### Development Workflow

Before committing changes:
```bash
deno task check-all  # Astro check + linting + formatting
deno task test       # Run tests
```

### Development Notes

- **Follow existing component patterns** in `src/components/`
- **Use the `PostsManager` utility** for content queries
- **Maintain type safety** with proper frontmatter schemas  
- **Preserve minimal aesthetic** when adding components
- **Test both local preview and deployed versions** before shipping
- **Use path aliases** for clean imports across the codebase