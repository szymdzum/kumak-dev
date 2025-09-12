# GitHub Deployment Implementation Steps

## Prerequisites Check

- [ ] Verify you're on the main branch: `git branch --show-current`
- [ ] Ensure GitHub CLI is authenticated: `gh auth status`
- [ ] Confirm repository: `git remote -v` should show `git@github.com:szymdzum/dev-hub.git`

## Step 1: Create GitHub Secret for Deno Deploy Token

### 1.1 Get Deno Deploy Token

```bash
# Open Deno Deploy dashboard
open https://dash.deno.com/account#access-tokens

# Manual steps:
# 1. Click "New Access Token"
# 2. Name it: "GitHub Actions Deploy"
# 3. Copy the token value (starts with ddp_)
```

### 1.2 Add Token to GitHub Repository

```bash
# Option A: Using GitHub CLI (recommended)
gh secret set DENO_DEPLOY_TOKEN --repo szymdzum/dev-hub

# Option B: Via GitHub UI
# 1. Go to: https://github.com/szymdzum/dev-hub/settings/secrets/actions
# 2. Click "New repository secret"
# 3. Name: DENO_DEPLOY_TOKEN
# 4. Value: [paste token from step 1.1]
# 5. Click "Add secret"
```

## Step 2: Create GitHub Actions Workflow Files

### 2.1 Create Workflow Directory

```bash
cd /Users/szymondzumak/Developer/dev-hub
mkdir -p .github/workflows
```

### 2.2 Create Simple Deploy Workflow

Create file: `.github/workflows/deploy.yml`

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
    permissions:
      contents: read
      deployments: write
    defaults:
      run:
        working-directory: ./blog

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Cache Deno dependencies
        uses: actions/cache@v3
        with:
          path: |
            ~/.deno
            ~/.cache/deno
          key: ${{ runner.os }}-deno-${{ hashFiles('**/deno.lock') }}
          restore-keys: |
            ${{ runner.os }}-deno-

      - name: Build project
        run: deno task build

      - name: Upload to Deno Deploy
        run: |
          deno install -A --global jsr:@deno/deployctl
          deployctl deploy \
            --project=kumak-blog \
            --token=${{ secrets.DENO_DEPLOY_TOKEN }} \
            --entrypoint=dist/server/entry.mjs
```

### 2.3 Create Full CI/CD Workflow

Create file: `.github/workflows/ci-cd.yml`

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
        deno-version: [v1.x]
    defaults:
      run:
        working-directory: ./blog

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

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
          restore-keys: |
            ${{ runner.os }}-deno-

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

      - name: Upload build artifacts
        if: github.ref == 'refs/heads/main'
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: blog/dist/
          retention-days: 30

  deploy:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    defaults:
      run:
        working-directory: ./blog

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: blog/dist/

      - name: Deploy to Deno Deploy
        run: |
          deno install -A --global jsr:@deno/deployctl
          deployctl deploy \
            --project=kumak-blog \
            --token=${{ secrets.DENO_DEPLOY_TOKEN }} \
            --entrypoint=dist/server/entry.mjs

      - name: Create deployment status
        if: always()
        run: |
          if [ "${{ job.status }}" == "success" ]; then
            echo "✅ Deployment successful"
          else
            echo "❌ Deployment failed"
          fi
```

### 2.4 Create Environment File Template

Create file: `blog/.env.example`

```bash
# Deno Deploy Token (get from https://dash.deno.com/account#access-tokens)
DENO_DEPLOY_TOKEN=ddp_your_token_here

# Site Configuration
SITE_URL=https://kumak.dev

# Optional: GitHub Token for automated PRs
GITHUB_TOKEN=ghp_your_token_here
```

## Step 3: Update Documentation

### 3.1 Update README

Add to `blog/README.md` after the existing content:

````markdown
## 🚀 Deployment

This blog automatically deploys to Deno Deploy via GitHub Actions.

### Automatic Deployment

Every push to `main` branch triggers automatic deployment to production.

### Manual Deployment

```bash
# Deploy from local machine
cd blog/
deno task deploy
```
````

### Setting Up Deployment

1. **Get Deno Deploy Token**
   ```bash
   open https://dash.deno.com/account#access-tokens
   ```

2. **Add to GitHub Secrets**
   ```bash
   gh secret set DENO_DEPLOY_TOKEN --repo szymdzum/dev-hub
   ```

3. **Verify Deployment**
   - Push to main branch
   - Check Actions tab: https://github.com/szymdzum/dev-hub/actions
   - Visit site: https://kumak.dev

### Rollback Procedure

If deployment fails, rollback to previous version:

1. **Via Deno Deploy Dashboard**:
   - Go to https://dash.deno.com/projects/kumak-blog
   - Click "Deployments"
   - Select previous working deployment
   - Click "Rollback"

2. **Via Git Revert**:
   ```bash
   git revert HEAD
   git push origin main
   ```

### Monitoring

- **Build Status**: Check [GitHub Actions](https://github.com/szymdzum/dev-hub/actions)
- **Deployment Logs**: View in [Deno Deploy Dashboard](https://dash.deno.com/projects/kumak-blog)
- **Site Status**: Monitor at https://kumak.dev

````
## Step 4: Test the Setup

### 4.1 Create Test Branch
```bash
git checkout -b test/deployment-pipeline
````

### 4.2 Make Test Change

```bash
# Make a small change to trigger the workflow
echo "<!-- Deployment test -->" >> blog/src/pages/index.astro
git add .
git commit -m "test: verify deployment pipeline"
git push origin test/deployment-pipeline
```

### 4.3 Create Pull Request

```bash
gh pr create \
  --title "Test deployment pipeline" \
  --body "Testing GitHub Actions CI/CD pipeline" \
  --base main
```

### 4.4 Verify CI Checks

```bash
# Watch CI status
gh pr checks

# Or open in browser
gh pr view --web
```

### 4.5 Merge and Deploy

```bash
# After CI passes
gh pr merge --auto --merge

# Monitor deployment
gh run list --workflow=deploy.yml --limit=1
gh run watch
```

## Step 5: Configure Branch Protection

### 5.1 Setup Branch Protection Rules

```bash
# Using GitHub CLI
gh api repos/szymdzum/dev-hub/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test (v1.x)"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

### 5.2 Or Configure via GitHub UI

```bash
# Open settings
open https://github.com/szymdzum/dev-hub/settings/branches

# Manual configuration:
# 1. Click "Add rule"
# 2. Branch name pattern: main
# 3. Enable:
#    - Require a pull request before merging
#    - Require approvals: 1
#    - Require status checks to pass
#    - Require branches to be up to date
#    - Select: "test (v1.x)" status check
# 4. Save changes
```

## Step 6: Verify Everything Works

### 6.1 Check GitHub Actions

```bash
# List recent workflow runs
gh run list --limit=5

# View specific run
gh run view

# Check for errors
gh run list --status=failure
```

### 6.2 Verify Deno Deploy

```bash
# Check deployment status
curl -I https://kumak.dev

# Should return HTTP 200 OK
```

### 6.3 Test Rollback

```bash
# Make a breaking change on purpose
echo "throw new Error('Test rollback')" > blog/src/pages/test-error.astro
git add . && git commit -m "test: intentional error for rollback test"
git push origin main

# Wait for deployment to fail, then rollback
open https://dash.deno.com/projects/kumak-blog/deployments
# Click "Rollback" on previous working version

# Clean up
git revert HEAD && git push origin main
```

## Step 7: Set Up Monitoring

### 7.1 GitHub Notifications

```bash
# Configure via UI
open https://github.com/settings/notifications

# Enable:
# - Actions: Email on workflow failure
# - Pull requests: Email on CI failure
```

### 7.2 Add Status Badge to README

Add to top of `blog/README.md`:

```markdown
[![Deploy Status](https://github.com/szymdzum/dev-hub/actions/workflows/deploy.yml/badge.svg)](https://github.com/szymdzum/dev-hub/actions/workflows/deploy.yml)
[![CI/CD](https://github.com/szymdzum/dev-hub/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/szymdzum/dev-hub/actions/workflows/ci-cd.yml)
```

## Troubleshooting Guide

### Common Issues and Solutions

1. **DENO_DEPLOY_TOKEN not found**
   ```bash
   # Verify secret exists
   gh secret list
   # Re-add if missing
   gh secret set DENO_DEPLOY_TOKEN
   ```

2. **Build fails locally but not in CI**
   ```bash
   # Clear Deno cache
   rm -rf ~/.deno ~/.cache/deno
   deno cache --reload blog/src/**/*.ts
   ```

3. **Deployment succeeds but site shows 404**
   ```bash
   # Check build output
   ls -la blog/dist/server/
   # Verify entry point exists
   test -f blog/dist/server/entry.mjs && echo "Entry point exists"
   ```

4. **Slow deployments**
   ```bash
   # Check cache hit rate in Actions log
   # If cache miss, check deno.lock is committed
   git add deno.lock && git commit -m "fix: add deno.lock for cache"
   ```

## Final Checklist

- [ ] DENO_DEPLOY_TOKEN added to GitHub Secrets
- [ ] Both workflow files created and committed
- [ ] Test deployment successful
- [ ] Branch protection enabled
- [ ] Documentation updated
- [ ] Status badges added
- [ ] Monitoring configured
- [ ] Rollback tested
- [ ] Team notified of new process

## Success Metrics

After implementation, you should see:

- ✅ Automatic deployments on every merge to main
- ✅ All PRs run tests before merge
- ✅ Deployment time < 2 minutes
- ✅ Zero failed deployments in first week
- ✅ Successful rollback demonstration
