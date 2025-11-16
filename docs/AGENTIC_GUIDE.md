# Agentic Infrastructure Guide

> **AI Agent Context**: Essential information for autonomous operation within this blog infrastructure.

## System Architecture Map

### Infrastructure Stack

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│ GitHub Actions   │───▶│ Deno Deploy EA │
│ szymdzum/kumak- │    │  CI Workflow     │    │   6 regions     │
│       dev       │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Local Dev     │    │   Build System   │    │  Live Website   │
│  deno task dev  │    │ Astro → Static   │    │  kumak.dev      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow

```
Source Code → Pre-commit Hooks → CI Quality Gates → deployctl → Deno Deploy EA
     │              │                   │              │              │
     ▼              ▼                   ▼              ▼              ▼
Components     Format/Lint         TypeScript     OIDC Auth      Cloudflare
 Content         Build               Check         Deploy         Edge Cache
Utilities                            Validate      dist/          (6 regions)
```

## Agent Operating Context

### Current Environment State

```typescript
interface BlogInfrastructure {
  platform: 'Deno Deploy Early Access';
  project: 'devblog';
  organization: 'szymdzum';
  status: 'production-ready';
  legacyDependencies: 0;

  deployment: {
    method: 'GitHub Actions + deployctl';
    authentication: 'OIDC tokens';
    trigger: 'push to main branch';
    entrypoint: 'https://deno.land/std/http/file_server.ts';
    root: 'dist/';
  };

  performance: {
    avgLatency: '<9ms';
    errorRate: '0.00%';
    regions: 6;
    uptime: '100%';
  };

  pipeline: {
    lintAndFormat: '~10s';
    buildTime: '~30s';
    deployTime: '~30s';
    totalPipeline: '<2min';
    successRate: '100%';
  };
}
```

### Project Structure

```typescript
interface ProjectStructure {
  components: {
    count: 6;
    files: ['BlogPostCard', 'Footer', 'FormattedDate', 'Head', 'Hero', 'NavBar'];
    linesOfCode: 316;
  };

  layouts: {
    count: 1;
    files: ['BaseLayout'];
  };

  pages: {
    count: 4;
    files: ['index', 'about', '[...slug]', 'rss.xml'];
    linesOfCode: 156;
  };

  utilities: {
    count: 1;
    files: ['path.ts'];
    purpose: 'Active link detection for navigation';
  };

  content: {
    blogPosts: 2;
    schema: 'Zod-validated (src/content/config.ts)';
  };
}
```

### Critical Paths

```bash
# Agent development workflow
deno task dev                 # Local development server (localhost:4321)
deno task check-all          # Lint + format check (no astro check)
deno task build              # Build static site to dist/
git push origin main         # Triggers CI → Deploy

# Agent troubleshooting
deno cache --reload src/     # Clear Deno module cache
deno task fix                # Auto-fix lint and format issues
gh run list --limit=5        # Check GitHub Actions status
```

## Agent Decision Framework

### Pre-Action Checks

```typescript
interface PreActionValidation {
  checkList: {
    lintPasses: boolean;        // deno lint (79 rules)
    formatCorrect: boolean;     // deno fmt --check
    buildSucceeds: boolean;     // deno task build
    noAnyTypes: boolean;        // TypeScript strict mode
    semanticHTML: boolean;      // Accessibility compliance
  };
}
```

### Safe Operation Zones

```
🟢 SAFE - Always allowed:
- Content creation/editing (src/content/blog/*.md, *.mdx)
- Component development (src/components/*.astro)
- Utility functions (src/utils/*.ts)
- Styling with design tokens (src/styles/global.css)
- Layout modifications (src/layouts/BaseLayout.astro)

🟡 CAUTION - Verify impact:
- Configuration changes (astro.config.mjs, deno.json)
- CI/CD workflow modifications (.github/workflows/ci.yml)
- Package dependencies (package.json)
- Path aliases (tsconfig.json, deno.json)

🔴 RESTRICTED - Avoid unless critical:
- DNS configuration (Cloudflare manual changes)
- Deno Deploy project settings (console.deno.com)
- Security tokens (environment variables, GitHub secrets)
- Breaking changes to content schema (src/content/config.ts)
```

## Agent Knowledge Base

### Infrastructure Constraints

```typescript
interface OperationalLimits {
  // Free tier limitations
  githubActions: '2,000 minutes/month'; // Currently using <100
  denoDeployEA: 'free tier'; // Well within limits
  cloudflare: 'free plan'; // Sufficient for traffic

  // Performance targets
  totalPipeline: '<2 minutes'; // Current: <2min
  lintAndFormat: '<15 seconds'; // Current: ~10s
  buildTime: '<40 seconds'; // Current: ~30s
  pageLoad: '<2 seconds'; // Static + CDN optimized

  // Quality requirements
  lintViolations: 0; // 79 rules enforced
  typeErrors: 0; // TypeScript strict mode
  anyTypes: 0; // Blocked by lint rules
  buildErrors: 0; // Must build successfully
}
```

### Key Configuration Patterns

```javascript
// Astro configuration for static generation
export default defineConfig({
  output: 'static',              // NEVER change to SSR without consultation
  site: 'https://kumak.dev',     // Production URL constant
  integrations: [mdx(), sitemap()],
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
})

// Deno import patterns (JSR preferred)
{
  "imports": {
    "zod": "jsr:@zod/zod@^4.1.8",
    "@std/fs": "jsr:@std/fs@^1.0.19",
    "@components/*": "./src/components/*",
    "@utils/*": "./src/utils/*"
  }
}

// Component patterns (follow existing structure)
---
export interface Props {
  readonly title: string;
  readonly description?: string;
}

const { title, description } = Astro.props;
---

<article>
  <h1>{title}</h1>
  {description && <p>{description}</p>}
</article>

<style>
  article {
    padding: var(--space-lg);
    max-width: 65ch;
  }
</style>
```

## Agent Error Recovery

### Common Issues & Resolutions

```typescript
interface ErrorRecoveryMap {
  'Build fails': [
    'Run: deno task build',
    'Check TypeScript errors in output',
    'Verify all imports resolve correctly',
    'Check for missing dependencies in package.json'
  ];

  'Lint violations': [
    'Run: deno task fix',
    'Manually fix remaining issues',
    'NEVER use any types (blocked by no-explicit-any rule)',
    'Check for unused variables'
  ];

  'Format check fails': [
    'Run: deno fmt',
    'Commit formatted files',
    'Verify deno.json fmt config matches project style'
  ];

  'Deployment issues': [
    'Check GitHub Actions logs: gh run view --log',
    'Verify Deno Deploy console: console.deno.com/szymdzum/devblog',
    'Check OIDC permissions in workflow (id-token: write)',
    'Verify dist/ directory was created during build'
  ];

  'DNS/SSL issues': [
    'Check DNS propagation: dig kumak.dev',
    'Verify CNAME to alias.deno.net',
    'Check Cloudflare proxy status (orange cloud)',
    'Verify SSL certificate: curl -I https://kumak.dev'
  ];
}
```

### Recovery Commands

```bash
# Full system reset (use when confused)
deno cache --reload
deno task fix
deno task check-all
deno task build

# Deployment verification
gh run list --workflow=CI
gh run view --log
curl -I https://kumak.dev

# Emergency rollback (if needed)
git revert HEAD
git push origin main
```

## Agent Communication Protocols

### Status Reporting Format

```
✅ Action: [Brief description]
📊 Impact: [Performance/behavior change]  
🔍 Verification: [How to confirm success]
⚠️  Risks: [Potential issues to monitor]
```

### Information Hierarchy

```
1. CRITICAL: Production site down, security vulnerabilities
2. HIGH: Build failures, CI/CD pipeline broken, type errors
3. MEDIUM: Performance degradation, new features, dependency updates
4. LOW: Documentation updates, minor optimizations, content changes
```

## Agent Integration Points

### CI/CD Pipeline (.github/workflows/ci.yml)

```yaml
# Agent should understand this flow
1. Checkout code (actions/checkout@v4)
2. Setup Deno v2.x (denoland/setup-deno@v1)
3. Setup Node.js 20 (actions/setup-node@v4)
4. Install dependencies (npm ci)
5. Lint (deno lint)
6. Format check (deno fmt --check)
7. Build (deno task build)
8. Deploy (denoland/deployctl@v1) [main branch only]
```

**Authentication**: OIDC tokens (id-token: write permission)

### Monitoring Endpoints

```bash
# Agent can query these for system status
https://console.deno.com/szymdzum/devblog     # Deno Deploy dashboard
https://github.com/szymdzum/kumak-dev/actions # GitHub Actions CI/CD
https://kumak.dev                             # Live production site
```

### Available EA Features (Not Yet Used)

```typescript
interface AvailableFeatures {
  cronJobs: 'Scheduled tasks for content updates';
  edgeFunctions: 'Dynamic content generation at edge';
  kvStorage: 'Key-value storage for user data';
  queues: 'Background job processing';
  openTelemetry: 'Advanced monitoring and tracing';
}
```

## Agent Development Patterns

### Content Creation

```markdown
---
title: "Post Title"
description: "Brief description (required)"
pubDate: 2025-11-16
heroImage: "/blog-placeholder.jpg"
draft: false
category: "tutorial"
tags: ["typescript", "astro"]
author: "Szymon Dzumak"
featured: false
---

Content here using MDX features...
```

**Schema validation**: Zod schema in src/content/config.ts enforces all required fields.

### Component Development

```astro
---
export interface Props {
  readonly title: string;
  readonly tags?: readonly string[];
}

const { title, tags = [] } = Astro.props;
---

<article>
  <h2>{title}</h2>
  {tags.length > 0 && (
    <ul>
      {tags.map(tag => <li>{tag}</li>)}
    </ul>
  )}
</article>

<style>
  article {
    padding: var(--space-lg);
    border: 1px solid var(--color-border);
  }

  h2 {
    font-size: var(--text-xl);
    margin: 0 0 var(--space-md) 0;
  }
</style>
```

### Content Queries

```typescript
import { getCollection } from "astro:content";

// Get all published posts
const posts = await getCollection("blog", ({ data }) => !data.draft);

// Sort by date (newest first)
const sortedPosts = posts.sort(
  (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
);

// Filter by category
const tutorials = posts.filter(({ data }) => data.category === "tutorial");

// Get featured posts
const featured = posts.filter(({ data }) => data.featured).slice(0, 3);
```

**Note**: There is NO PostsManager utility. Use Astro's `getCollection()` with standard JavaScript array methods.

## Agent Success Metrics

### Quality Indicators

```
✅ deno lint passes (0 violations)
✅ deno fmt --check passes (all files formatted)
✅ deno task build succeeds (no TypeScript errors)
✅ Site loads in <2s (static + CDN optimized)
✅ Zero any types (enforced by no-explicit-any rule)
✅ Deno Deploy console shows 0.00% error rate
✅ Semantic HTML (accessibility compliance)
```

### Performance Targets

```
Lint + Format: <15 seconds (current: ~10s)
Build Time: <40 seconds (current: ~30s)
Deploy Time: <40 seconds (current: ~30s)
Total Pipeline: <2 minutes (current: <2min)
Site Load: <2 seconds (static + Cloudflare CDN)
Uptime: 99.9%+ (multi-region Deno Deploy)
```

## Agent Operational Guidelines

### Design Token System

All spacing, typography, and colors use CSS custom properties from `src/styles/global.css`:

```css
/* Spacing (harmonic 1.25 ratio) */
--space-xs, --space-sm, --space-md, --space-lg, --space-xl, --space-2xl, --space-3xl

/* Typography */
--text-xs, --text-sm, --text-base, --text-lg, --text-xl, --text-2xl, --text-3xl

/* Colors */
--color-text, --color-text-muted, --color-primary, --color-bg, --color-border
```

**Agent rule**: ALWAYS use design tokens, NEVER hardcode measurements.

### CSS Architecture

```
global.css          → Design tokens + reset + utilities ONLY
Component <style>   → All component-specific presentation
BaseLayout <style>  → Page layout + prose styles (is:global)
```

**Agent rule**: NO component styles in global.css, NO element selectors in global.css.

### TypeScript Strictness

```typescript
// ✅ GOOD: Explicit types, readonly
export interface BlogPost {
  readonly title: string;
  readonly slug: string;
  readonly pubDate: Date;
}

// ❌ BAD: any types (blocked by linter)
const data: any = await fetch(); // LINT ERROR: no-explicit-any

// ❌ BAD: Implicit any (blocked by tsconfig)
function process(data) { // TYPE ERROR: noImplicitAny
  return data;
}
```

**Agent rule**: TypeScript strict mode is enforced. No any types allowed.

---

**Agent Operating Manual**  
**Version**: 2.0 - Accurate Infrastructure State  
**Last Updated**: November 16, 2025  
**Infrastructure Status**: Production-ready, OIDC-authenticated deployments
