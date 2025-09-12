# CLAUDE.md
**The Null Hypothesis** is an Astro-based blog with Deno runtime, designed around mystical/gnostic theming. The architecture emphasizes simplicity and type safety while providing sophisticated content management.

### Core Tech Stack
- **Astro 5.13.5** with SSR mode and Deno adapter
- **Pure Deno runtime** (no Node.js dependencies)
- **Content Collections** with Zod schemas for type safety
- **Deno Deploy** via GitHub Actions

### Essential Commands
```bash
# Development
deno task dev          # Start dev server at localhost:4321
deno task build        # Build for production
deno task preview      # Preview production build locally

# Quality Assurance
deno task test         # Run all tests (95 comprehensive tests)
deno task test:watch   # Run tests in watch mode for development
deno task test:coverage # Run tests with coverage reporting
deno task lint         # Lint code with 79 strict rules
deno task format       # Format code with consistent style
deno task check        # Run lint + format together
deno task check-all    # Full type checking + lint + format + tests

# Deployment
deno task deploy       # Build and deploy to Deno Deploy
```

### Key Architecture Patterns

**Component Organization:**
- `src/layouts/` - Page layout templates

**Content Management:**
- `src/content/blog/` - Blog posts with frontmatter
- `src/content/config.ts` - Content collection schemas
- `src/utils/postSorter.ts` - PostsManager class for sophisticated content queries

**Configuration:**
- `src/site-config.ts` - Centralized site metadata, navigation, and featured projects
- Path aliases: `@components/*`, `@layouts/*`, `@utils/*` for clean imports

### PostsManager Utility

The `PostsManager` class provides a fluent API for content operations:

```typescript
// Filter by featured posts, limit results, sort by date
const posts = new PostsManager(allPosts)
  .filter('featured')
  .sort('date-desc')
  .limit(3)
  .get();
```

### Testing Infrastructure

Comprehensive test suite with **95 tests** covering all critical functionality:

**Test Structure:**
```
tests/
├── unit/
│   ├── postSorter.test.ts      # 39 tests - PostsManager functionality
│   ├── siteConfig.test.ts      # 27 tests - Site configuration validation  
│   └── contentConfig.test.ts   # 20 tests - Zod schema validation
├── integration/
│   └── contentCollections.test.ts # 9 tests - Real-world workflows
└── utils/
    └── testHelpers.ts          # Mock data and test utilities
```

**Quality Standards:**
- **Strict TypeScript** with `exactOptionalPropertyTypes` and comprehensive checks
- **79 linting rules** including `no-any`, `no-unused-vars`, `prefer-const`
- **Automated formatting** with 120-character line width
- **Type-safe mock data** for consistent testing

### Content Structure

Blog posts support:
- Hero images (`heroImage` in frontmatter)
- Publication and update dates
- Description and title metadata
- MDX for interactive content

### Deployment Configuration

- **Primary**: Deno Deploy project `kumak-blog`
- **Domain**: Currently configured for `kumak.dev` (may need updating)
- **Workflows**: Two GitHub Actions - simple deploy and full CI/CD with testing
- **Build output**: SSR with `dist/server/entry.mjs` entrypoint

## Comprehensive Documentation

For detailed technical documentation, see the repository-wide documentation:

- **[Architecture](../docs/claude/context/architecture.md)** - Complete system architecture, build pipeline, and deployment
- **[Dependencies](../docs/claude/context/dependencies.md)** - Tech stack analysis, Deno runtime, and package management
- **[Content Management](../docs/claude/context/content-management.md)** - Content Collections, PostsManager utility, and SEO
- **[Development Workflow](../docs/DEVELOPMENT_WORKFLOW.md)** - Multi-layer protection system for code quality
- **[Claude Mastery Guides](../docs/claude/guides/)** - Complete workflow system for AI-assisted development

### Development Notes

- **Follow existing component patterns** in `src/components/`
- **Use the `PostsManager` utility** for complex content queries
- **Maintain type safety** with proper frontmatter schemas
- **Preserve the mystical theme aesthetic** in new components
- **Run quality checks** before committing: `deno task check-all`
- **Write tests** for new functionality following existing patterns in `tests/`
- **Test both local preview and deployed versions** before shipping
- **Reference detailed documentation** in `../docs/claude/` for implementation guidance

### Quality Workflow

Before committing changes, always run:
```bash
deno task check-all  # Type checking + linting + formatting
deno task test       # Full test suite (95 tests)
```
