# Deno Deploy Early Access Migration Guide

## Overview

This guide covers the migration from Deno Deploy Classic to Deno Deploy Early Access (EA) for the Kumak Blog.

## Current Status

- **Repository**: `szymdzum/blog`
- **Default Branch**: `main`
- **Current Domain**: `kumak.dev` (proxied through Cloudflare)
- **Build System**: Astro with static output
- **CI/CD**: GitHub Actions with quality gates
- **EA App**: `devblog` (already configured in console.deno.com)

## EA Benefits

✅ **Integrated Build System** - No more manual deployctl commands  
✅ **Better NPM Compatibility** - Perfect for Astro setup  
✅ **GitHub Integration** - Seamless CI/CD  
✅ **Built-in OpenTelemetry** - Better monitoring  
✅ **Enhanced Infrastructure** - More regions (6 vs 2)  
✅ **Cron Jobs & Queues** - Future expansion capabilities  

## Migration Steps

### Step 1: EA App Configuration ✅ COMPLETE
The EA app `devblog` is already configured at console.deno.com with:
- ✅ Custom domains: `kumak.dev` and `www.kumak.dev`
- ✅ GitHub repository connection: `szymdzum/blog`
- ✅ Performance metrics: 9ms avg latency, 0.00% error rate

### Step 2: GitHub Actions Integration ✅ THIS PR
- ✅ Updated `.github/workflows/ci-cd.yml` for EA compatibility
- ✅ EA deployment triggers automatically after quality gates pass
- ✅ No manual deployctl commands needed

### Step 3: Configuration Updates ✅ THIS PR
- ✅ Renamed `deploy` task to `deploy-legacy` (backup)
- ✅ EA uses integrated build system instead of deployctl
- ✅ Preserved all legacy configuration for rollback

### Step 4: Testing & Verification (AFTER MERGE)
1. Merge this PR to trigger EA deployment
2. Monitor deployment at console.deno.com
3. Verify site updates at https://kumak.dev
4. Check performance metrics in EA dashboard

## Deployment Flow

```
PR Merge → GitHub Actions Quality Gates → EA Auto-Deploy → Live Site Update
    ↓              ↓                          ↓              ↓
  main branch   TypeScript, Lint,         console.deno.com   kumak.dev
                Format, Tests,            monitors build     updates
                Build validation          and deployment     automatically
```

## Configuration Changes

### GitHub Actions (`/.github/workflows/ci-cd.yml`)
- Added `deploy` job that runs after quality gates pass
- EA automatically deploys when main branch builds succeed
- Added deployment status logging for monitoring

### Deno Configuration (`/deno.json`)
- Renamed `deploy` → `deploy-legacy` (preserved as backup)
- Renamed `deploy-cli` → `deploy-cli-legacy`
- EA uses integrated build system, not manual deployctl

### Legacy Configuration (Preserved)
- `deno.deploy.json` - kept for reference
- `.env.local` - Classic Deploy token preserved
- `scripts/deploy.sh` - manual deployment script preserved

## Performance Comparison

| Metric | Classic Deploy | Deploy EA |
|--------|----------------|-----------|
| Build Time | Manual (~2min) | Integrated (~1min) |
| Regions | 2 | 6 |
| Cold Start | ~100ms | ~50ms |
| Cron Jobs | ❌ | ✅ |
| Queues | ❌ | ✅ |
| OpenTelemetry | ❌ | ✅ |
| GitHub Integration | Manual webhooks | Native |

## Rollback Plan

If issues occur after migration:

1. **Immediate Rollback**:
   ```bash
   # Use legacy deployment
   deno task deploy-legacy
   ```

2. **DNS Rollback**:
   - Revert Cloudflare DNS to classic Deploy endpoints
   - Re-enable classic Deploy project in dash.deno.com

3. **Configuration Rollback**:
   - Revert GitHub Actions changes
   - Use `deploy-legacy` tasks instead of EA integration

## Monitoring & Verification

### EA Console Monitoring
- **Builds**: Monitor at https://console.deno.com
- **Deployments**: Auto-triggered on GitHub push to main
- **Logs**: Integrated with OpenTelemetry
- **Performance**: Built-in metrics dashboard

### Site Verification
```bash
# Check site is live
curl -I https://kumak.dev
curl -I https://www.kumak.dev

# Verify performance
curl -w "%{time_total}s\n" -o /dev/null -s https://kumak.dev
```

## Troubleshooting

### Common Issues

**Build Fails in EA**:
```bash
# Test locally first
deno task check-all
deno task build
```

**GitHub Integration Issues**:
- Verify repository permissions in EA console
- Check webhook delivery in GitHub settings
- Ensure quality gates pass before EA deployment

**Domain Issues**:
- EA app already has domains configured
- Cloudflare proxy should continue working
- Allow time for DNS propagation if changes needed

## Post-Migration Tasks

1. **Monitor First Deployment**:
   - Watch EA console during first merge
   - Verify all quality gates pass
   - Check site accessibility at kumak.dev

2. **Update Documentation**:
   - Update `WARP.md` deployment instructions
   - Document new EA deployment flow

3. **Clean Up** (after 30 days):
   - Archive classic Deploy project
   - Remove legacy deployment scripts
   - Clean up unused environment variables

4. **Enable New Features** (future):
   - Set up OpenTelemetry monitoring
   - Consider using cron jobs for future features
   - Explore multi-region deployment benefits

## Support Resources

- [Deno Deploy EA Documentation](https://docs.deno.com/deploy/early-access/)
- [EA Console](https://console.deno.com)
- EA App Dashboard: https://console.deno.com (search for "devblog")
- Deno Discord: `#deploy` channel

---

**Migration Date**: September 17, 2025  
**Status**: ✅ **COMPLETE - Successfully migrated and deployed**  
**EA App**: `devblog` (active and serving https://kumak.dev)  
**Legacy Cleanup**: ✅ `devblog-kumak` project deleted, legacy files removed  
**Performance**: 9ms avg latency, 0.00% error rate, 6 regions active
