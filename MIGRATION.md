# kumak.dev Domain Migration Documentation

**Migration Date**: September 2024  
**From**: Squarespace → Cloudflare Registrar + Deno Deploy  
**Domain**: kumak.dev  
**Repository**: szymdzum/blog  

## 🎯 Migration Goals Achieved

- ✅ **Cost Reduction**: ~$10-15/year savings on domain fees
- ✅ **Unified Management**: All services in Cloudflare ecosystem
- ✅ **Modern Hosting**: Static site on Deno Deploy EA with better performance
- ✅ **Enhanced Security**: Cloudflare protection + automated security monitoring
- ✅ **Developer Experience**: Automated deployments via Git integration

## 📋 Migration Timeline

### Phase 1: Preparation (Completed)
- [x] Obtained domain authorization code from Squarespace: `mynGii8RWyk1!@Aa`
- [x] Created feature branch: `migrate-domain-to-cloudflare`
- [x] Set up Deno Deploy EA project: `devblog`
- [x] Configured build system and deployment automation

### Phase 2: Infrastructure Setup (Completed)
- [x] Built Astro blog with static site generation
- [x] Created deployment scripts (`scripts/deploy.sh`)
- [x] Configured environment variables
- [x] Set up DNS validation scripts (`scripts/validate-domain.sh`)

### Phase 3: Domain Transfer (Completed)
- [x] Initiated domain transfer in Cloudflare Dashboard
- [x] Added custom domains in Deno Deploy console
- [x] Configured DNS records in Cloudflare

### Phase 4: Verification (Completed)
- [x] Validated domain resolution
- [x] Tested SSL certificate
- [x] Verified blog functionality

## 🛠️ Technical Configuration

### Repository Structure
```
blog/
├── scripts/
│   ├── deploy.sh              # Automated deployment
│   └── validate-domain.sh     # Post-migration validation
├── deno.deploy.json           # Deno Deploy EA configuration
├── .env.template              # Environment template
├── .env.local                 # Local development config
└── MIGRATION.md               # This documentation
```

### Key Configuration Files

#### `deno.deploy.json`
```json
{
  "project": "devblog",
  "entrypoint": "./dist/index.html",
  "build": {
    "command": "deno task build",
    "output": "dist"
  },
  "static": true,
  "domains": ["kumak.dev", "www.kumak.dev"]
}
```

#### Environment Variables
```bash
DENO_DEPLOY_TOKEN=ddp_6SNnIDvommOcGb440rkSwhgBu6F6W52SSMqQ
DOMAIN=kumak.dev
WWW_DOMAIN=www.kumak.dev
```

### DNS Configuration (Current State)
```
Type: CNAME
Name: @
Target: alias.deno.net
Proxy: Yes (Cloudflare)

Type: CNAME
Name: www
Target: kumak.dev
Proxy: Yes (Cloudflare)

Type: CNAME
Name: _acme-challenge
Target: 7c1f15d49930c21cd25b691a9dba0d56._acme.deno.net
Proxy: No (DNS only)

Type: CNAME
Name: _acme-challenge.www
Target: a6f9d42f26b4b38081ff213d6f5276a7._acme.deno.net
Proxy: No (DNS only)

Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```

## 🚀 Deployment Process

### Automated Deployment
1. **Push to GitHub**: Changes to main branch trigger automatic deployment
2. **Deno Deploy EA**: Automatically builds and deploys static site
3. **CDN Distribution**: Cloudflare CDN serves content globally

### Manual Deployment
```bash
# Build and deploy manually
./scripts/deploy.sh

# Validate after deployment
./scripts/validate-domain.sh
```

## 🔍 Post-Migration Validation

### DNS and Connectivity Tests
- **DNS Resolution**: `dig kumak.dev`
- **HTTPS Connection**: `curl -I https://kumak.dev`
- **WWW Redirect**: `curl -I https://www.kumak.dev`
- **SSL Certificate**: Check expiration and issuer

### Performance Metrics
- **Response Time**: < 500ms target
- **SSL Labs Grade**: A+ target
- **Lighthouse Score**: 90+ target
- **CDN Coverage**: Global distribution via Cloudflare

## 🔧 Maintenance Commands

```bash
# Deploy latest changes
./scripts/deploy.sh

# Validate domain and SSL
./scripts/validate-domain.sh

# Build locally for testing
deno task build
deno task dev

# Run tests
deno test

# Lint and format
deno task lint
deno task format
```

## 🆘 Troubleshooting

### Common Issues

**DNS not resolving**
- Check DNS propagation: https://dnschecker.org
- Verify CNAME targets in Cloudflare
- Wait 24-48 hours for full propagation

**SSL certificate issues**
- Disable/re-enable Cloudflare proxy
- Check certificate in Cloudflare SSL/TLS tab
- Verify domain validation

**Deployment failures**
- Check Deno Deploy console logs
- Verify GitHub integration
- Ensure build commands work locally

### Rollback Plan
1. **DNS Rollback**: Revert DNS records to previous configuration
2. **Domain Transfer**: Can be cancelled within first 5 days
3. **Hosting**: Keep Squarespace active until migration verified

## 📊 Migration Benefits Realized

### Cost Savings
- **Domain Registration**: $9.15/year (vs ~$20-25/year)
- **Hosting**: Free tier (vs ~$144/year)
- **Total Annual Savings**: ~$150-200/year

### Performance Improvements
- **Global CDN**: Cloudflare edge locations worldwide
- **Static Site**: Faster loading, better SEO
- **Modern Stack**: Deno + Astro for optimal performance

### Developer Experience
- **Git-based Deployments**: Push to deploy
- **Modern Tooling**: Deno ecosystem
- **Automated Testing**: CI/CD integration
- **Better Monitoring**: Built-in observability

## 📝 Lessons Learned

1. **Domain transfers take time**: Plan 5-7 days for completion
2. **DNS propagation varies**: Some regions update faster than others  
3. **Automation is key**: Scripts reduce manual errors
4. **Documentation matters**: Essential for future maintenance
5. **Testing is crucial**: Validate every step before going live

## 🔗 Useful Resources

- [Cloudflare Domain Transfer Guide](https://developers.cloudflare.com/registrar/get-started/transfer-domain-to-cloudflare/)
- [Deno Deploy EA Documentation](https://docs.deno.com/deploy/early-access/)
- [Astro Static Site Generation](https://docs.astro.build/en/guides/static-site-generation/)
- [DNS Checker Tool](https://dnschecker.org)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)

---

**Migration Status**: ✅ **MIGRATION COMPLETED SUCCESSFULLY** ✅
**Domain**: https://kumak.dev (Live and Functional)
**SSL**: Valid certificates for both kumak.dev and www.kumak.dev
**Completed**: September 17, 2025
