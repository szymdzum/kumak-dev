# Deployment & Configuration Guide

> **Token Efficiency Rule**: Precise, actionable information. Reference this guide for deployment decisions.

## Deno Deploy Early Access Overview

**What is EA?**\
Complete revamp of classic Deploy with enhanced infrastructure, better NPM compatibility, and integrated build system.

**Key Improvements:**

- **Build System**: Integrated (no manual deployctl)
- **NPM Compatibility**: Enhanced web framework support
- **Infrastructure**: Significantly improved, 6 regions vs 2
- **Observability**: Built-in OpenTelemetry integration
- **Performance**: ~50% faster builds, ~50% faster cold starts

**Dashboard**: https://console.deno.com (EA) vs https://dash.deno.com (Classic)

## Current Infrastructure

### EA Project Configuration

```
Project: devblog
Organization: szymdzum  
Dashboard: https://console.deno.com/szymdzum/devblog
Regions: 6 worldwide
Performance: 9ms avg latency, 0.00% error rate
```

### Domains & SSL

```
Primary: kumak.dev → alias.deno.net (Cloudflare proxied)
WWW: www.kumak.dev → kumak.dev (Cloudflare proxied)  
SSL: Let's Encrypt auto-renewal (60-day cycle)
```

### DNS Records (Cloudflare)

```
kumak.dev       CNAME  alias.deno.net          (proxied)
www.kumak.dev   CNAME  kumak.dev               (proxied)
_acme-challenge CNAME  [EA_SSL_VALIDATION]     (not proxied)
```

## Deployment Pipeline

### GitHub Actions Integration

**File**: `.github/workflows/ci-cd.yml`

**Triggers:**

- Push to `main` branch
- Pull requests to `main`

**Pipeline Flow:**

```
Code Push → Quality Gates → EA Auto-Deploy → Live Site
    ↓           ↓              ↓            ↓
GitHub     TypeScript,     EA Build      kumak.dev
          Lint, Format,    System        (6 regions)
          Tests, Build
```

**Quality Gates (27s):**

1. **TypeScript**: `deno run -A npm:astro check`
2. **Linting**: `deno lint` (79 rules)
3. **Formatting**: `deno fmt --check`
4. **Testing**: `deno test` (2/2 tests)
5. **Build**: `deno task build` (6 pages)

**EA Deployment:**

- **Automatic**: EA deploys when quality gates pass
- **No Manual**: No deployctl commands needed
- **Monitoring**: console.deno.com build logs

### Performance Metrics

```
Quality Gates:    ~27 seconds
EA Build:         ~1 minute  
Total Pipeline:   <2 minutes
Success Rate:     100%
```

## Configuration Files

### Core Configuration

```javascript
// astro.config.mjs - Static site generation
export default defineConfig({
  site: 'https://kumak.dev',
  output: 'static',
  integrations: [mdx(), sitemap()],
  compressHTML: true,
  vite: {
    build: {
      cssMinify: true,
      minify: 'terser',
    },
  },
})
```

### Deno Project Setup

```json
// deno.json - EA-optimized configuration
{
  "tasks": {
    "dev": "deno run -A npm:astro dev",
    "build": "deno run -A npm:astro build",
    "check-all": "deno run -A npm:astro check && deno lint && deno fmt",
    "test": "deno test --allow-read --allow-env"
  },
  "imports": {
    // JSR packages only (no npm: for imports)
    "zod": "jsr:@zod/zod@^4.1.8",
    "@std/fs": "jsr:@std/fs@^1.0.19"
  },
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "jsxImportSource": "astro"
  }
}
```

### Environment Configuration

```bash
# .env.example - EA uses GitHub integration
SITE_URL=https://kumak.dev
GITHUB_TOKEN=ghp_optional_for_automation

# NOTE: No DENO_DEPLOY_TOKEN needed for EA
# EA uses GitHub app integration automatically
```

## Security & Access Control

### Cloudflare Configuration

```
SSL/TLS Mode: Full (Strict)
Always Use HTTPS: Disabled (prevents EA redirect conflicts)
Proxy Status: Enabled (orange cloud)
```

### GitHub Integration

```
Access: GitHub App integration (automatic)
Secrets: No manual tokens required for deployment
Permissions: EA app has repository read access
```

### Token Management

```bash
# Legacy Classic Deploy token (unused)
DENO_DEPLOY_TOKEN=ddp_6SNnIDvommOcGb440rkSwhgBu6F6W52SSMqQ

# Cloudflare API (for DNS management)  
CF_API_TOKEN=UzWF1U5Nd7nsPeTlQ_6YZIAXxbL8-a6s5yzOkZ_q

# Security: Tokens in environment, never in code
```

## Deployment Commands

### Development

```bash
# Local development
deno task dev              # http://localhost:4321

# Quality assurance
deno task check-all        # All checks
deno task test             # Run tests
```

### Production Deployment

```bash
# EA integrated deployment
git push origin main       # Triggers EA auto-deploy

# Manual build verification
deno task build            # Local build test
deno task preview          # Preview production build
```

### Monitoring

```bash
# Check deployment status
gh run list --workflow="Quality Gates & Deploy" --limit=5

# View live metrics
open https://console.deno.com/szymdzum/devblog
```

## Troubleshooting

### Common Issues

**Build Failures:**

```bash
# Local verification
deno task check-all        # Run all quality gates
deno cache --reload src/   # Clear Deno cache
```

**SSL/Domain Issues:**

```bash
# Check DNS propagation
dig kumak.dev
dig www.kumak.dev

# Verify SSL certificates
curl -I https://kumak.dev
```

**EA Dashboard Access:**

- URL: https://console.deno.com
- Project: `szymdzum/devblog`
- Organization: `szymdzum`

### Performance Monitoring

```
EA Console: Build logs, metrics, traces
GitHub Actions: CI/CD status and artifacts
Cloudflare: DNS, CDN, security analytics
```

## Migration Notes

### EA vs Classic Deploy

```
Classic Deploy:
- Manual deployctl commands
- 2 regions
- Basic logging
- Manual SSL management

EA Deploy:
- Integrated build system
- 6 regions  
- OpenTelemetry observability
- Auto SSL management
```

### Legacy Cleanup Status

```
✅ devblog-kumak project deleted
✅ Legacy config files removed
✅ Manual deploy tasks removed  
✅ Environment variables updated
✅ Zero legacy dependencies
```

## Cost Structure

### Current Usage (Free Tiers)

```
GitHub Actions: ~100 min/month (of 2,000)
Deno Deploy EA: Well within free limits
Cloudflare: Free plan sufficient
Total Cost: $0/month
```

### Scaling Projections

```
10x Traffic: Still free
100x Traffic: ~$20/month (EA Pro)
Enterprise: Custom pricing
```

## Available EA Features

### Active Features

```
✅ Static site generation
✅ Multi-region deployment  
✅ Auto SSL certificates
✅ GitHub integration CI/CD
✅ Build artifact caching
```

### Available (Not Used)

```
🔄 Cron Jobs: Scheduled tasks
🔄 Edge Functions: Dynamic content
🔄 KV Storage: Key-value data  
🔄 Queues: Background processing
🔄 OpenTelemetry: Advanced observability
```

## Best Practices

### Development Workflow

1. **Feature branches**: Work in branches, not main
2. **Quality gates**: Must pass before EA deployment
3. **Testing**: Comprehensive test coverage
4. **Documentation**: Update guides for changes

### Security Practices

1. **No tokens in code**: Environment variables only
2. **Scoped access**: Minimal required permissions
3. **Regular rotation**: Review and update tokens
4. **Audit logs**: Monitor access patterns

### Performance Optimization

1. **Static generation**: Leverage Astro's static output
2. **Asset optimization**: Images, CSS, JS minification
3. **Caching**: Cloudflare edge + browser caching
4. **Monitoring**: Track EA console metrics

---

**Last Updated**: September 17, 2025\
**EA Project**: `szymdzum/devblog`\
**Status**: Production-ready, zero legacy dependencies
