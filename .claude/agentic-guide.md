# Agentic Infrastructure Guide

> **AI Agent Context**: Essential information for autonomous operation within this blog infrastructure.

## System Architecture Map

### Infrastructure Stack

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│ GitHub Actions   │───▶│ Deno Deploy EA │
│   szymdzum/blog │    │ Quality Gates    │    │   6 regions     │
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
Source Code → Pre-commit Hooks → Quality Gates → EA Build → Global CDN
     │              │                │             │           │
     ▼              ▼                ▼             ▼           ▼
Components     Format/Lint      TypeScript    Minified    Cloudflare
 Content         Test            Validation     Static      Edge Cache
Utilities      Type Safety       Build Test     Assets      (6 regions)
```

## Agent Operating Context

### Current Environment State

```typescript
interface BlogInfrastructure {
  platform: 'Deno Deploy Early Access'
  project: 'devblog'
  organization: 'szymdzum'
  status: 'production-ready'
  legacyDependencies: 0

  performance: {
    avgLatency: '9ms'
    errorRate: '0.00%'
    regions: 6
    uptime: '100%'
  }

  pipeline: {
    qualityGates: '27s'
    totalBuild: '~1min'
    deployment: 'automatic'
    successRate: '100%'
  }
}
```

### Critical Paths

```bash
# Agent development workflow
deno task dev                 # Local development server
deno task check-all          # Run all quality gates
deno task test               # Execute test suite
git push origin main         # Deploy to production

# Agent troubleshooting
deno cache --reload src/     # Clear module cache
deno task build              # Verify build locally
gh run list --limit=5        # Check CI/CD status
```

## Agent Decision Framework

### Pre-Action Checks

```typescript
interface PreActionValidation {
  // Always verify before making changes
  checkList: {
    qualityGatesPass: boolean // deno task check-all
    testsPass: boolean // deno task test
    buildSucceeds: boolean // deno task build
    noLegacyRefs: boolean // No old deploy patterns
  }
}
```

### Safe Operation Zones

```
🟢 SAFE - Always allowed:
- Content creation/editing (src/content/blog/)
- Component development (src/components/)
- Utility functions (src/utils/)
- CSS/styling (src/styles/)
- Test creation (tests/)

🟡 CAUTION - Verify impact:
- Configuration changes (astro.config.mjs, deno.json)
- CI/CD workflow modifications (.github/workflows/)
- Package dependencies (package.json)

🔴 RESTRICTED - Avoid unless critical:
- DNS configuration (manual Cloudflare changes)
- EA project settings (console.deno.com manual changes)
- Security tokens (environment variables)
```

## Agent Knowledge Base

### Infrastructure Constraints

```typescript
interface OperationalLimits {
  // Free tier limitations
  githubActions: '2,000 minutes/month' // Currently using ~100
  denoDeployEA: 'within free limits' // No current concerns
  cloudflare: 'free plan sufficient' // Current traffic level

  // Performance targets
  buildTime: '<2 minutes total' // Current: ~1 minute
  qualityGates: '<30 seconds' // Current: ~27 seconds
  pageLoad: '<2 seconds' // Optimized static

  // Quality requirements
  testCoverage: '100% passing' // Current: 2/2 tests
  lintCompliance: '0 violations' // 79 rules enforced
  typeCompliance: 'strict mode' // No 'any' types
}
```

### Key Configuration Patterns

```javascript
// Agent should understand these patterns

// Astro configuration for static generation
export default defineConfig({
  output: 'static',              // Never change to SSR without consultation
  site: 'https://kumak.dev',     // Production URL constant
  integrations: [mdx(), sitemap()], // Core integrations
})

// Deno import patterns (JSR preferred)
{
  "imports": {
    "zod": "jsr:@zod/zod@^4.1.8",        // Use JSR packages
    "@components/*": "./src/components/*", // Path aliases established
  }
}

// Component patterns (follow existing structure)
---
interface Props {
  title: string
  description?: string  // Optional props with defaults
}
const { title, description = 'Default value' } = Astro.props
---
<article>
  <h1>{title}</h1>
  {description && <p>{description}</p>}
</article>
```

## Agent Error Recovery

### Common Issues & Resolutions

```typescript
interface ErrorRecoveryMap {
  'Build fails': [
    'deno cache --reload src/',
    'deno task check-all',
    "Check for 'any' types (blocked by hooks)",
  ]

  'Tests fail': [
    'deno task test',
    'Check test file imports',
    'Verify PostsManager usage patterns',
  ]

  'Lint violations': [
    'deno task fix',
    'Manual fix remaining issues',
    "Never use 'any' types",
  ]

  'Deployment issues': [
    'Check GitHub Actions logs',
    'Verify EA console at console.deno.com',
    'DNS propagation: dig kumak.dev',
  ]
}
```

### Recovery Commands

```bash
# Full system reset (use when confused)
deno cache --reload
deno task fix-all
deno task check-all
deno task test

# Deployment verification
gh run list --workflow="Quality Gates & Deploy"
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
1. CRITICAL: Production site down, security issues
2. HIGH: Build failures, quality gate violations  
3. MEDIUM: Performance degradation, new features
4. LOW: Documentation updates, minor optimizations
```

## Agent Integration Points

### CI/CD Hooks

```yaml
# Agent should understand this GitHub Actions flow
- Quality Gates (TypeScript, lint, format, tests)
- Build Verification (Astro static generation)
- EA Auto-Deploy (when main branch updated)
- Artifact Storage (30-day retention for debugging)
```

### Monitoring Endpoints

```bash
# Agent can query these for system status
https://console.deno.com/szymdzum/devblog     # EA dashboard
https://github.com/szymdzum/blog/actions      # CI/CD status
https://kumak.dev                             # Live site
```

### Available Integrations (EA Features)

```typescript
// Features agent could leverage in future
interface AvailableFeatures {
  cronJobs: 'Scheduled content updates'
  edgeFunctions: 'Dynamic content generation'
  kvStorage: 'User preferences, analytics'
  queues: 'Background processing'
  openTelemetry: 'Advanced monitoring'
}
```

## Agent Development Patterns

### Content Creation

```typescript
// Blog post pattern (agent should follow)
---
title: "Post Title"
description: "Brief description"
pubDate: 2025-09-17
heroImage: "/blog-placeholder-1.jpg"
tags: ["tag1", "tag2"]
---

Content here using MDX features...
```

### Component Development

```typescript
// Follow existing component patterns
---
interface Props {
  // Define props with TypeScript
}
const { prop } = Astro.props
---

<element>
  <!-- Use semantic HTML -->
  <!-- Follow accessibility patterns -->
</element>

<style>
  /* Use CSS custom properties */
  /* Follow design token system */
</style>
```

### Utility Functions

```typescript
// Use PostsManager for content operations
const posts = new PostsManager(allPosts)
  .filter('published')
  .sort('date-desc')
  .limit(10)
  .get()
```

## Agent Success Metrics

### Quality Indicators

```
✅ All quality gates pass (<30s)
✅ Tests maintain 100% pass rate
✅ Build completes without errors
✅ Site loads <2s (static optimized)
✅ Zero 'any' types in TypeScript
✅ EA console shows 0.00% error rate
```

### Performance Targets

```
Build Time: <1 minute (current: ~1min)
Deploy Time: <2 minutes total (current: ~2min)  
Site Speed: <2s load (static + CDN)
Uptime: 99.9%+ (multi-region EA)
```

---

**Agent Operating Manual**\
**Version**: 1.0 - EA Production\
**Last Updated**: September 17, 2025\
**Infrastructure Status**: Fully migrated, zero legacy dependencies
