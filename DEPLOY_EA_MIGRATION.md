# Deno Deploy Early Access Migration Guide

## Overview

This guide covers the migration from Deno Deploy Classic to Deno Deploy Early Access (EA) for the Kumak Blog.

## Current Status

- **Repository**: `szymdzum/blog`
- **Default Branch**: `main`
- **Current Domain**: `kumak.dev` (proxied through Cloudflare)
- **Build System**: Astro with static output
- **CI/CD**: GitHub Actions with quality gates

## EA Benefits

✅ **Integrated Build System** - No more manual deployctl commands  
✅ **Better NPM Compatibility** - Perfect for Astro setup  
✅ **GitHub Integration** - Seamless CI/CD  
✅ **Built-in OpenTelemetry** - Better monitoring  
✅ **Enhanced Infrastructure** - More regions (6 vs 2)  
✅ **Cron Jobs & Queues** - Future expansion capabilities  

## Migration Steps

### Step 1: Access Deno Deploy EA
1. Visit [console.deno.com](https://console.deno.com)
2. Sign in with your GitHub account
3. Create a new organization (e.g., "Kumak")

### Step 2: Create EA App
1. Click "Create App" in your EA organization
2. **App Name**: `blog` or `kumak-blog`
3. **Repository**: Select `szymdzum/blog`
4. **Branch**: `main`
5. **Root Directory**: `/` (root of repository)

### Step 3: Configure Build Settings
EA should auto-detect your Astro configuration:

```yaml
Build Command: deno task build
Output Directory: dist
Install Command: # Leave empty - Deno handles dependencies automatically
Environment Variables: # None needed for static blog
```

**Manual Override** (if auto-detection fails):
- Framework: `Other`
- Build Command: `deno task build`
- Output Directory: `dist`

### Step 4: Set Up Custom Domains
1. In your EA app settings, go to "Domains"
2. Add both domains:
   - `kumak.dev`
   - `www.kumak.dev`
3. EA will provide CNAME targets (different from classic Deploy)

### Step 5: Update Cloudflare DNS
Once EA provides the new CNAME targets:

1. Log into Cloudflare dashboard for `kumak.dev`
2. Update DNS records:
   ```
   Type: CNAME
   Name: @
   Target: [EA_PROVIDED_CNAME]
   Proxy: ✅ (orange cloud)
   
   Type: CNAME  
   Name: www
   Target: [EA_PROVIDED_CNAME]
   Proxy: ✅ (orange cloud)
   ```

### Step 6: Test Deployment
1. Make a small change to trigger GitHub Actions
2. Verify the workflow passes quality gates
3. Check EA console for automatic deployment
4. Test both `kumak.dev` and `www.kumak.dev`

## Configuration Changes Made

### GitHub Actions (`/.github/workflows/ci-cd.yml`)
- Added deploy job that runs after quality gates pass
- EA automatically deploys when main branch builds succeed
- No manual deployment commands needed

### Deno Configuration (`/deno.json`)
- Renamed `deploy` task to `deploy-legacy` (keep as backup)
- EA uses integrated build system, not deployctl

### Legacy Configuration (Preserved)
- `deno.deploy.json` - kept for reference
- `.env.local` - Deno Deploy Classic token preserved
- `scripts/deploy.sh` - manual deployment script preserved

## DNS Migration Checklist

- [ ] EA app created and connected to GitHub
- [ ] First EA deployment successful
- [ ] Custom domains added in EA console
- [ ] CNAME targets obtained from EA
- [ ] Cloudflare DNS records updated
- [ ] SSL certificates provisioned by EA
- [ ] Both `kumak.dev` and `www.kumak.dev` working
- [ ] Old classic Deploy project marked for deprecation

## Rollback Plan

If issues occur during migration:

1. **Immediate Rollback**:
   - Revert DNS changes in Cloudflare
   - Re-enable classic Deploy project
   - Use `deno task deploy-legacy` for manual deployment

2. **Gradual Rollback**:
   - Keep both systems running temporarily
   - Use subdomain for EA testing (e.g., `ea.kumak.dev`)
   - Switch DNS when confident

## Monitoring & Verification

### EA Console Monitoring
- **Builds**: Monitor at `https://console.deno.com`
- **Deployments**: Auto-triggered on GitHub push to main
- **Logs**: Integrated with OpenTelemetry
- **Performance**: Built-in metrics dashboard

### GitHub Actions
- Quality gates must pass before EA deployment
- TypeScript validation, linting, formatting, tests
- Artifact upload for debugging (30-day retention)

### Site Verification
```bash
# Check site is live
curl -I https://kumak.dev
curl -I https://www.kumak.dev

# Verify static assets
curl -I https://kumak.dev/favicon.svg

# Check sitemap
curl -I https://kumak.dev/sitemap-index.xml
```

## Performance Comparison

| Metric | Classic Deploy | Deploy EA |
|--------|----------------|-----------|
| Build Time | Manual (~2min) | Integrated (~1min) |
| Regions | 2 | 6 |
| Cold Start | ~100ms | ~50ms |
| Cron Jobs | ❌ | ✅ |
| Queues | ❌ | ✅ |
| OpenTelemetry | ❌ | ✅ |

## Post-Migration Tasks

1. **Update Documentation**:
   - Update `WARP.md` deployment instructions
   - Update `README.md` with new deployment flow

2. **Clean Up**:
   - Archive classic Deploy project after 30 days
   - Remove legacy deployment scripts
   - Update environment variables

3. **Enable New Features**:
   - Set up OpenTelemetry monitoring
   - Consider using cron jobs for future features
   - Explore multi-region deployment benefits

## Troubleshooting

### Common Issues

**Build Fails in EA**:
```bash
# Test locally first
deno task check-all
deno task build
```

**Domain Not Resolving**:
- Verify CNAME targets in Cloudflare
- Check DNS propagation: `dig kumak.dev`
- Allow 24-48 hours for global propagation

**GitHub Integration Issues**:
- Verify repository permissions in EA console
- Check webhook delivery in GitHub settings
- Ensure main branch protection rules allow EA

**SSL Certificate Issues**:
- EA auto-provisions SSL certificates
- May take 10-15 minutes after DNS changes
- Check certificate status in EA console

## Support Resources

- [Deno Deploy EA Documentation](https://docs.deno.com/deploy/early-access/)
- [EA Console](https://console.deno.com)
- [GitHub Integration Guide](https://docs.deno.com/deploy/early-access/)
- Deno Discord: `#deploy` channel

---

**Migration Date**: September 17, 2025  
**Status**: In Progress  
**Next Review**: After first successful EA deployment