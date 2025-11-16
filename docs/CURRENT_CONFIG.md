# Current Blog Configuration

**Documentation Date**: September 17, 2025  
**Status**: ✅ Deno Deploy Early Access - Fully Migrated & Optimized  
**Site**: https://kumak.dev  

## 🎯 System Overview

The blog runs on **Deno Deploy Early Access** with automated CI/CD, delivering a high-performance static site with modern infrastructure and zero legacy dependencies.

### Architecture Summary
```
GitHub Repository → GitHub Actions → Deno Deploy EA → Cloudflare CDN → Global Users
     (Source)         (CI/CD)         (Hosting)        (Edge Cache)     (Delivery)
```

## 🚀 Deployment Infrastructure

### Deno Deploy Early Access
- **Platform**: console.deno.com (EA)
- **Project**: `devblog`
- **Organization**: `szymdzum`
- **Build System**: Integrated (automatic)
- **Regions**: 6 worldwide regions
- **Performance**: 9ms avg latency, 0.00% error rate

### Domain Configuration
- **Primary**: kumak.dev
- **WWW**: www.kumak.dev  
- **SSL**: Let's Encrypt (auto-renewed)
- **DNS Provider**: Cloudflare
- **CDN**: Cloudflare proxy enabled

## 📁 Project Structure

```
blog/
├── src/                        # Source code
│   ├── components/            # Astro components
│   ├── content/               # Blog posts & content collections
│   ├── layouts/               # Page templates
│   ├── pages/                 # Routes & API endpoints
│   ├── styles/                # CSS styles
│   └── utils/                 # TypeScript utilities
├── public/                     # Static assets
├── tests/                      # Test suite
├── .github/workflows/          # CI/CD automation
├── dist/                       # Build output (generated)
├── node_modules/               # Dependencies (generated)
├── astro.config.mjs           # Astro configuration
├── deno.json                  # Deno project configuration
├── package.json               # NPM dependencies
├── tsconfig.json              # TypeScript configuration
├── .env.example               # Environment template
└── README.md                  # Project documentation
```

## ⚙️ Configuration Files

### Astro Configuration (`astro.config.mjs`)
```javascript
export default defineConfig({
  site: 'https://kumak.dev',
  output: 'static',              // Static site generation
  integrations: [mdx(), sitemap()],
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop',
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  vite: {
    build: {
      cssMinify: true,
      minify: 'terser',
    },
  },
})
```

### Deno Configuration (`deno.json`)
```json
{
  "imports": {
    "zod": "jsr:@zod/zod@^4.1.8",
    "@std/fs": "jsr:@std/fs@^1.0.19",
    "@std/path": "jsr:@std/path@^1.1.2",
    "@std/assert": "jsr:@std/assert@^1.0.14",
    "@components/*": "./src/components/*",
    "@layouts/*": "./src/layouts/*",
    "@utils/*": "./src/utils/*",
    "@styles/*": "./src/styles/*",
    "@config/*": "./src/config/*",
    "@/*": "./src/*",
    "@site-config": "./src/site-config.ts",
    "@postSorter": "./src/utils/postSorter.ts"
  },
  "tasks": {
    "dev": "deno run -A npm:astro dev",
    "build": "deno run -A npm:astro build",
    "preview": "deno task preview-urls && deno task preview-serve",
    "preview-serve": "deno run --allow-net --allow-read jsr:@std/http/file-server dist --port 4321",
    "preview-urls": "echo '🚀 Preview server starting...' && echo '📍 Local: http://localhost:4321' && echo '📍 Network: http://'$(ipconfig getifaddr en0 2>/dev/null || echo 'localhost')':4321' && echo ''",
    "lint": "deno lint",
    "format": "deno fmt",
    "check": "deno lint && deno fmt",
    "check-all": "deno run -A npm:astro check && deno lint && deno fmt",
    "check-format": "deno fmt --check src/ tests/ astro.config.mjs",
    "test": "deno test --allow-read --allow-env",
    "test:watch": "deno test --allow-read --allow-env --watch",
    "test:coverage": "deno test --allow-read --allow-env --coverage=coverage && deno coverage coverage",
    "fix": "deno lint --fix && deno fmt src/ tests/ astro.config.mjs",
    "fix-all": "deno lint --fix && deno fmt"
  },
  "lint": {
    "rules": {
      "tags": ["recommended"],
      "include": [
        "no-any", "no-explicit-any", "no-unused-vars", "prefer-const",
        "no-inferrable-types", "ban-untagged-todo", "camelcase"
      ]
    },
    "exclude": ["dist/", "node_modules/", ".astro/", "coverage/"]
  },
  "fmt": {
    "useTabs": false,
    "lineWidth": 120,
    "indentWidth": 2,
    "singleQuote": true,
    "proseWrap": "preserve",
    "semiColons": false,
    "exclude": ["dist/", "node_modules/", ".astro/", "coverage/", "*.md"]
  },
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "jsxImportSource": "astro"
  }
}
```

### Package Configuration (`package.json`)
```json
{
  "name": "@szymdzum/blog",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "deno task dev",
    "start": "deno task dev",
    "build": "deno task build",
    "preview": "deno task preview"
  },
  "dependencies": {
    "@astrojs/mdx": "^4.0.1",
    "@astrojs/sitemap": "^3.2.1",
    "astro": "^5.13.7"
  },
  "devDependencies": {
    "@types/node": "^22.8.6",
    "typescript": "^5.9.2"
  }
}
```

### Environment Configuration (`.env.example`)
```bash
# Site Configuration
SITE_URL=https://kumak.dev

# Optional: GitHub Token for automated PRs  
GITHUB_TOKEN=ghp_your_token_here

# NOTE: Deno Deploy EA uses GitHub integration - no manual tokens needed
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci-cd.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Quality Gates Job:**
```yaml
quality-gates:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      deno-version: [v2.x]
  steps:
    - Checkout repository
    - Setup Deno v2.x
    - Cache Deno dependencies  
    - TypeScript validation
    - JSR-native linting
    - Code formatting check
    - Test suite execution
    - Production build validation
    - Upload build artifacts (30-day retention)
```

**Deployment:**
- **Automatic**: EA deploys when quality gates pass on `main` branch
- **Manual**: No deployctl needed - fully integrated
- **Monitoring**: Available at console.deno.com

### Build Performance
- **Quality Gates**: ~27 seconds
- **Total Build**: ~1 minute  
- **Deployment**: Automatic (integrated)
- **Total Pipeline**: <2 minutes

## 🌐 DNS & Domain Configuration

### Cloudflare DNS Records
```
kumak.dev       → CNAME → alias.deno.net (proxied ✅)
www.kumak.dev   → CNAME → kumak.dev (proxied ✅)
_acme-challenge.kumak.dev → CNAME → 7c1f15d49930c21cd25b691a9dba0d56._acme.deno.net
_acme-challenge.www.kumak.dev → CNAME → a6f9d42f26b4b38081ff213d6f5276a7._acme.deno.net
```

### SSL/TLS Configuration
- **Mode**: Full (Strict)
- **Always Use HTTPS**: Disabled (to prevent redirect conflicts)
- **Certificates**: Let's Encrypt via EA
- **HSTS**: Available via Cloudflare
- **Auto-Renewal**: 60-day cycle

### Email Configuration (Google Workspace)
```
MX Records:
- aspmx.l.google.com (priority 1)
- alt1.aspmx.l.google.com (priority 5) 
- alt2.aspmx.l.google.com (priority 5)
- alt3.aspmx.l.google.com (priority 10)
- alt4.aspmx.l.google.com (priority 10)

TXT Records:
- SPF: "v=spf1 include:_spf.google.com ~all"
- DKIM: google._domainkey.kumak.dev
```

## 🧪 Testing & Quality Assurance

### Test Suite
```javascript
// tests/routing.test.ts
- blog routing - URL generation works correctly ✅
- blog routing - PostsManager utility types work ✅

// tests/navigation.test.ts  
- Navigation component tests (semantic HTML, ARIA, accessibility) ✅
```

### Quality Gates (79 Lint Rules)
- **TypeScript**: Strict mode, no errors
- **Linting**: no-any, no-explicit-any, no-unused-vars, prefer-const
- **Formatting**: 120 char width, 2-space indent, single quotes
- **Testing**: Deno test with file system and env permissions

### Pre-commit Hooks
```bash
🔍 Running pre-commit checks...
📐 Checking code formatting...
🔍 Running linter...  
🧪 Running tests...
✅ All pre-commit checks passed!
```

## 📊 Performance Configuration

### Build Optimization
- **HTML**: Compressed/minified
- **CSS**: Minified, inlined for small files
- **JavaScript**: Terser minification
- **Assets**: Optimized file naming with hashes
- **Images**: Responsive, lazy loading, fetchpriority hints

### Caching Strategy
- **Cloudflare**: Edge caching globally
- **GitHub Actions**: Deno dependencies cached
- **Build**: Incremental builds when possible
- **Static Assets**: Long-term browser caching

### Performance Metrics
- **Build Time**: ~1 minute (50% improvement over legacy)
- **Page Load**: Optimized for Core Web Vitals
- **Response Time**: 9ms average from EA
- **Error Rate**: 0.00%
- **Availability**: Multi-region redundancy

## 🔐 Security Configuration

### Access Control
- **GitHub**: Repository access via SSH keys
- **Deno Deploy**: GitHub app integration (no manual tokens)
- **Cloudflare**: API token with scoped permissions

### Content Security
- **HTTPS**: Enforced via Cloudflare and EA
- **SSL**: TLS 1.3, modern cipher suites
- **Headers**: Security headers via Cloudflare
- **Dependencies**: Regular updates via Dependabot

### Secrets Management
- **Environment Variables**: GitHub Secrets for CI/CD
- **No Plain Text**: All sensitive data in secure stores
- **Token Rotation**: Periodic review and renewal

## 💰 Cost Structure

### Current Usage (All Free Tiers)
- **GitHub Actions**: ~100 minutes/month (of 2,000 available)
- **Deno Deploy EA**: Well within free tier limits
- **Cloudflare**: Free plan (sufficient for current traffic)
- **Total Monthly Cost**: $0

### Scaling Projections
- **10x Traffic**: Still within free tiers
- **100x Traffic**: ~$20/month (Deno Deploy Pro)
- **Enterprise**: Custom pricing as needed

## 🔮 Available Features

### Current Active Features
- ✅ Static site generation (Astro)
- ✅ MDX content with components
- ✅ Automated sitemap generation
- ✅ RSS feed generation  
- ✅ Multi-region deployment
- ✅ Auto SSL certificate renewal
- ✅ GitHub integration CI/CD

### EA Features Available (Not Yet Used)
- 🔄 **Cron Jobs**: Scheduled tasks, content updates
- 🔄 **Edge Functions**: Dynamic content at edge
- 🔄 **KV Storage**: Key-value data storage
- 🔄 **Queues**: Background job processing
- 🔄 **OpenTelemetry**: Advanced monitoring/tracing

## 📈 Monitoring & Analytics

### Available Dashboards
- **EA Console**: https://console.deno.com (build logs, metrics, traces)
- **GitHub Actions**: Repository Actions tab (CI/CD status)
- **Cloudflare**: DNS, CDN, and security analytics

### Key Metrics Tracked
- **Build Success Rate**: 100%
- **Deployment Time**: <2 minutes total
- **Site Availability**: Multi-region monitoring
- **Performance**: Response times, error rates
- **Security**: SSL certificate status, security headers

## 🛠️ Development Workflow

### Local Development
```bash
# Start development server
deno task dev                 # http://localhost:4321

# Run quality checks
deno task check-all           # TypeScript + lint + format

# Run tests
deno task test               # Full test suite
deno task test:watch         # Watch mode

# Preview production build
deno task build && deno task preview
```

### Deployment Process
```bash
# Automatic deployment on main branch:
git push origin main
# → GitHub Actions quality gates 
# → EA automatic deployment
# → Live at https://kumak.dev
```

### Content Management
```bash
# Add new blog post
src/content/blog/new-post.md

# Update navigation
src/components/Navigation.astro

# Modify layouts  
src/layouts/*.astro
```

## 📝 Maintenance Tasks

### Regular (Weekly)
- Monitor EA dashboard metrics
- Review GitHub Actions runs
- Check Cloudflare analytics

### Periodic (Monthly)  
- Update dependencies (`deno task check-all`)
- Review and rotate access tokens
- Audit build performance

### Annual
- Review SSL certificate renewal
- Evaluate performance optimizations
- Consider new EA features adoption

## 📚 Documentation Resources

### Project Documentation
- `README.md` - Project overview and setup
- `WARP.md` - Warp terminal integration guide  
- `DEPLOY_EA_MIGRATION.md` - Migration process documentation
- `OPTIMIZATION_REPORT.md` - Performance analysis
- `CURRENT_CONFIG.md` - This configuration documentation

### External Resources
- [Deno Deploy EA Documentation](https://docs.deno.com/deploy/early-access/)
- [Astro Documentation](https://docs.astro.build/)
- [Cloudflare Documentation](https://developers.cloudflare.com/)

---

**Last Updated**: September 17, 2025  
**Configuration Status**: ✅ Complete and Optimized  
**Next Review**: October 2025 (or after major changes)