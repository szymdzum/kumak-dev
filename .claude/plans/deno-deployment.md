# Deno Deployment Implementation Plan

## Architecture Decisions

### Current State Analysis

- **Repository**: `dev-hub` monorepo with blog at `/blog/`
- **Framework**: Astro 5.13.5 with SSR mode
- **Runtime**: Pure Deno (no Node.js dependencies)
- **Deployment Target**: Deno Deploy project `kumak-blog`
- **Build Output**: `dist/server/entry.mjs` (848KB)
- **GitHub CLI**: Already authenticated as `szymdzum`
- **Repository URL**: `git@github.com:szymdzum/dev-hub.git`

### Deployment Strategy Decision

**GitHub Actions** for CI/CD automation with two workflows:

1. **Simple Deploy**: Direct deployment on push to main
2. **Full CI/CD**: Testing + quality checks + deployment

**Rationale**:

- GitHub Actions provides seamless integration with Deno Deploy
- Automated testing prevents broken deployments
- Built-in rollback capabilities
- Free tier sufficient for project needs
- Native GitHub integration for PR checks

## Code Dependencies Map

### Build Dependencies

```
astro.config.mjs
├── @astrojs/deno (adapter)
├── @astrojs/mdx (content)
└── @astrojs/sitemap (SEO)

deno.json
├── Tasks (build, deploy, test)
├── Import maps (path aliases)
├── Lint rules (79 rules)
└── Format config

package.json
├── astro@5.13.5
├── @astrojs/deno@5.0.1
└── typescript@5.9.2
```

### Deployment Chain

```
GitHub Push → GitHub Actions → deno task build → deployctl → Deno Deploy
                     ↓
              Quality Checks
              (lint, format, test)
```

## File-by-File Change List

### 1. `.github/workflows/deploy.yml` (NEW)

```yaml
name: Deploy to Deno Deploy

on:
  push:
    branches: [main]
    paths:
      - 'blog/**'
      - '.github/workflows/deploy.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./blog

    steps:
      - uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Build project
        run: deno task build

      - name: Deploy to Deno Deploy
        run: |
          deno install -A --global jsr:@deno/deployctl
          deployctl deploy --project=kumak-blog --token=${{ secrets.DENO_DEPLOY_TOKEN }} dist/server/entry.mjs
```

### 2. `.github/workflows/ci-cd.yml` (NEW)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
    paths:
      - 'blog/**'
      - '.github/workflows/**'
  pull_request:
    branches: [main]
    paths:
      - 'blog/**'

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        deno-version: [1.x, canary]
    defaults:
      run:
        working-directory: ./blog

    steps:
      - uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: ${{ matrix.deno-version }}

      - name: Cache Deno dependencies
        uses: actions/cache@v3
        with:
          path: |
            ~/.deno
            ~/.cache/deno
          key: ${{ runner.os }}-deno-${{ hashFiles('**/deno.lock') }}

      - name: Type check
        run: deno run -A npm:astro check

      - name: Lint
        run: deno lint

      - name: Format check
        run: deno fmt --check

      - name: Run tests
        run: deno task test

      - name: Build project
        run: deno task build

  deploy:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./blog

    steps:
      - uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Build and Deploy
        run: |
          deno task build
          deno install -A --global jsr:@deno/deployctl
          deployctl deploy --project=kumak-blog --token=${{ secrets.DENO_DEPLOY_TOKEN }} dist/server/entry.mjs
```

### 3. `.env.example` (NEW)

```bash
# Deno Deploy Token (get from https://dash.deno.com/account#access-tokens)
DENO_DEPLOY_TOKEN=your_token_here

# Optional: Custom domain configuration
SITE_URL=https://kumak.dev
```

### 4. `README.md` (UPDATE)

Add section after existing content:

````markdown
## Deployment

This blog is deployed to Deno Deploy via GitHub Actions.

### Setup

1. **Get Deno Deploy Token**
   - Visit [Deno Deploy Dashboard](https://dash.deno.com/account#access-tokens)
   - Create a new access token
   - Copy the token value

2. **Configure GitHub Secrets**
   - Go to repository Settings → Secrets and variables → Actions
   - Add new secret: `DENO_DEPLOY_TOKEN` with your token

3. **Deploy**
   - Push to `main` branch triggers automatic deployment
   - Check Actions tab for deployment status

### Manual Deployment

```bash
cd blog/
deno task deploy
```
````

### Troubleshooting

- **Build fails**: Check `deno task check-all` locally
- **Deploy fails**: Verify DENO_DEPLOY_TOKEN is set
- **404 errors**: Ensure SSR mode in astro.config.mjs

````
### 5. `blog/.gitignore` (NO CHANGE)
Already properly configured:
- Excludes `dist/`
- Excludes `.env` files
- Excludes `node_modules/`

## Implementation Steps

### Phase 1: GitHub Repository Setup (10 mins)
1. Navigate to https://github.com/szymdzum/dev-hub/settings
2. Go to Secrets and variables → Actions
3. Add new repository secret:
   - Name: `DENO_DEPLOY_TOKEN`
   - Value: Token from Deno Deploy dashboard
4. Verify Actions are enabled in repository settings

### Phase 2: Create Workflow Files (15 mins)
1. Create directory structure:
   ```bash
   mkdir -p .github/workflows
````

2. Create `deploy.yml` with simple deployment workflow
3. Create `ci-cd.yml` with full testing pipeline
4. Create `.env.example` in blog directory
5. Commit changes to feature branch

### Phase 3: Test Deployment Pipeline (20 mins)

1. Create test branch:
   ```bash
   git checkout -b test-deployment
   ```
2. Make small change to trigger workflow
3. Push to GitHub and create PR
4. Verify CI checks pass
5. Merge PR and verify deployment

### Phase 4: Documentation & Monitoring (10 mins)

1. Update README.md with deployment instructions
2. Set up GitHub notifications for failed workflows
3. Configure Deno Deploy alerts
4. Document rollback procedure

## Edge Cases & Gotchas

### Critical Security Considerations

1. **Token Security**:
   - NEVER commit DENO_DEPLOY_TOKEN to repository
   - Use GitHub Secrets exclusively
   - Rotate token every 90 days

2. **Branch Protection**:
   - Enable branch protection rules for `main`
   - Require PR reviews before merge
   - Require status checks to pass

### Build & Deployment Issues

1. **Build Cache Problems**:
   - GitHub Actions caches at `~/.deno` and `~/.cache/deno`
   - Clear cache if dependencies don't update:
     ```yaml
     - name: Clear cache
       run: rm -rf ~/.deno ~/.cache/deno
     ```

2. **Build Size Monitoring**:
   - Current entry.mjs: 848KB
   - Alert if >2MB (Deno Deploy limit: 20MB)
   - Monitor with: `ls -lh dist/server/entry.mjs`

3. **TypeScript Config Warning**:
   - Expected warning: "Unsupported compiler options: baseUrl, paths"
   - This is normal - Deno uses import maps instead
   - Do NOT try to fix this warning

### Runtime Considerations

1. **Environment Variables**:
   - Build-time vars: Set in GitHub Actions
   - Runtime vars: Set in Deno Deploy dashboard
   - Never use `process.env`, use `Deno.env.get()`

2. **Domain Configuration**:
   - Verify DNS: `kumak.dev` → Deno Deploy
   - SSL certificates auto-managed by Deno Deploy
   - Allow 24-48 hours for DNS propagation

3. **Deployment Rollback**:
   ```bash
   # Quick rollback via Deno Deploy dashboard
   # Or revert commit and push:
   git revert HEAD
   git push origin main
   ```

### Performance Monitoring

1. **Build Times**:
   - Expected: 1-2 minutes total
   - Alert if >5 minutes
   - Optimize by caching dependencies

2. **Deployment Frequency**:
   - Deno Deploy free tier: 100 deployments/day
   - Current usage: ~5-10 deployments/day
   - Monitor in Deno Deploy dashboard

3. **Runtime Metrics**:
   - Response time: Should be <100ms
   - Memory usage: Monitor in Deno Deploy
   - CPU time: Free tier limit awareness

## Dependencies to Watch

### Version Pinning Strategy

```json
{
  "@astrojs/deno": "^5.0.1", // Minor updates OK
  "astro": "^5.13.5", // Minor updates OK
  "deployctl": "latest", // Always latest
  "deno": "1.x" // Major version stable
}
```

### Update Schedule

- **Weekly**: Check for security updates
- **Monthly**: Update minor versions
- **Quarterly**: Evaluate major version updates

### Compatibility Matrix

| Component     | Version | Notes                    |
| ------------- | ------- | ------------------------ |
| Deno          | 1.46+   | Required for import maps |
| Astro         | 5.x     | SSR mode required        |
| @astrojs/deno | 5.x     | Must match Astro major   |
| deployctl     | Latest  | Auto-updated in workflow |

## Success Criteria Checklist

### Immediate Success

- [ ] GitHub Actions workflow runs without errors
- [ ] All 95 tests pass in CI pipeline
- [ ] Deployment completes in <2 minutes
- [ ] Site accessible at kumak.dev
- [ ] No TypeScript errors in build

### Ongoing Success

- [ ] Zero-downtime deployments achieved
- [ ] Rollback tested and documented
- [ ] Build artifacts preserved (30 days)
- [ ] Monitoring alerts configured
- [ ] Team trained on deployment process

### Quality Gates

- [ ] Lint: 0 errors (79 rules enforced)
- [ ] Format: All files formatted
- [ ] Tests: 95/95 passing
- [ ] Type check: No errors
- [ ] Build size: <2MB

## Rollback Procedures

### Immediate Rollback (< 5 mins)

1. Go to Deno Deploy dashboard
2. Select previous deployment
3. Click "Rollback to this deployment"

### Git-based Rollback (< 10 mins)

```bash
# Find the last good commit
git log --oneline -10

# Revert to it
git revert HEAD
git push origin main

# Or reset (if not yet deployed)
git reset --hard <commit-hash>
git push --force-with-lease origin main
```

### Emergency Procedures

1. **Site Down**:
   - Check Deno Deploy status page
   - Review GitHub Actions logs
   - Rollback via dashboard

2. **Bad Deploy**:
   - Immediate rollback via dashboard
   - Fix issue in new branch
   - Deploy fix through PR process

3. **Token Compromised**:
   - Revoke token in Deno Deploy immediately
   - Generate new token
   - Update GitHub Secret
   - Audit recent deployments

## Monitoring & Alerts

### Setup Notifications

1. **GitHub Actions**:
   - Settings → Notifications → Actions
   - Enable email for failed workflows

2. **Deno Deploy**:
   - Dashboard → Project Settings → Notifications
   - Configure email/webhook alerts

3. **Custom Monitoring**:
   ```yaml
   - name: Notify deployment
     if: success()
     run: |
       curl -X POST ${{ secrets.WEBHOOK_URL }} \
         -d "{'status': 'deployed', 'version': '${{ github.sha }}'}"
   ```

## Cost Analysis

### Current Usage (Free Tier)

- GitHub Actions: 2,000 mins/month (using ~100)
- Deno Deploy: 100,000 requests/day (using ~1,000)
- Storage: 1GB (using ~50MB)

### Scaling Considerations

- At 10x traffic: Still within free tier
- At 100x traffic: ~$20/month for Pro tier
- Monitor usage in Deno Deploy dashboard

## Final Notes

This implementation provides:

1. **Automated CI/CD** with comprehensive testing
2. **Zero-downtime deployments** via Deno Deploy
3. **Rollback capability** for quick recovery
4. **Cost-effective** solution within free tiers
5. **Production-ready** monitoring and alerts

The architecture leverages Deno's native capabilities while maintaining simplicity and reliability. The two-workflow approach balances speed (simple deploy) with safety (full CI/CD), allowing flexibility based on deployment needs.
