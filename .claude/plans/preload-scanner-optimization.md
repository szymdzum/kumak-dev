# Preload Scanner Optimization Implementation Plan

## Overview

This plan optimizes the blog's resource loading to work efficiently with the browser's preload scanner, improving Core Web Vitals and overall performance.

## Goals

- Reduce First Contentful Paint (FCP) by 30%
- Improve Largest Contentful Paint (LCP) by 40%
- Eliminate layout shifts (CLS < 0.1)
- Enable parallel resource loading via preload scanner

---

## Step 1: Performance Baseline

### Tasks

1. Measure current Core Web Vitals
2. Document resource loading waterfall
3. Identify render-blocking resources

### Acceptance Criteria

- [ ] Baseline metrics documented (FCP, LCP, CLS, TTFB)
- [ ] Resource waterfall screenshot captured
- [ ] Blocking resources list created

### Verification Commands

```bash
# Build and preview site
deno task build && deno task preview

# Test with Lighthouse CLI (if available)
npx lighthouse http://localhost:4321 --view
```

---

## Step 2: Self-Host Font Files

### Tasks

1. Download Inter font woff2 files (weights: 400, 500, 600, 700)
2. Create font subsets for Latin characters
3. Place in `public/fonts/` directory
4. Generate @font-face declarations

### File Structure

```
public/
  fonts/
    inter-latin-400.woff2
    inter-latin-500.woff2
    inter-latin-600.woff2
    inter-latin-700.woff2
```

### Acceptance Criteria

- [ ] Font files downloaded and optimized (< 20KB each)
- [ ] Latin subset created (reduces size by ~70%)
- [ ] Files accessible at `/fonts/inter-*.woff2`
- [ ] No 404 errors in network tab

### Verification

```bash
# Check font files exist
ls -lh public/fonts/*.woff2

# Verify fonts are served correctly
deno task dev
# Navigate to http://localhost:4321 and check Network tab
```

---

## Step 3: Update Font Loading Strategy

### Files to Modify

1. **src/components/Head.astro**
   - Remove Google Fonts links
   - Add font preloads
   - Add inline @font-face CSS

### Implementation

```astro
<!-- src/components/Head.astro -->
<head>
  <!-- Preload critical fonts -->
  <link rel="preload" href="/fonts/inter-latin-400.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/inter-latin-600.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/inter-latin-700.woff2" as="font" type="font/woff2" crossorigin />
  
  <!-- Inline critical @font-face -->
  <style>
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('/fonts/inter-latin-400.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC;
    }
    /* Repeat for other weights */
  </style>
</head>
```

### Acceptance Criteria

- [ ] Google Fonts links removed
- [ ] Font preloads added with correct attributes
- [ ] @font-face rules use `font-display: swap`
- [ ] Fonts load from local server
- [ ] Text renders immediately (FOIT eliminated)

### Verification

```bash
# Build and check HTML output
deno task build
grep -A5 "font-display" dist/index.html
grep "fonts.googleapis" dist/index.html # Should return nothing
```

---

## Step 4: Optimize Critical CSS

### Files to Modify

1. **src/styles/critical.css** (new file)
   - Extract above-fold styles
   - Include layout, typography, header styles

2. **src/components/Head.astro**
   - Inline critical CSS
   - Load main CSS asynchronously

### Implementation

```astro
<!-- src/components/Head.astro -->
<style>
  /* Inline critical CSS here */
  :root { /* Include CSS custom properties */ }
  body { /* Include base styles */ }
  header { /* Include header styles */ }
  h1, h2, h3 { /* Include typography */ }
</style>

<!-- Load non-critical CSS asynchronously -->
<link rel="preload" href="/_astro/main.*.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/_astro/main.*.css"></noscript>
```

### Acceptance Criteria

- [ ] Critical CSS inlined in <head> (< 14KB)
- [ ] Main CSS loads asynchronously
- [ ] No FOUC (Flash of Unstyled Content)
- [ ] First paint occurs faster

### Verification

```bash
# Check critical CSS is inlined
deno task build
head -50 dist/index.html | grep -c "<style>"

# Verify no render blocking CSS
# Use Chrome DevTools Coverage tab
```

---

## Step 5: Optimize Image Loading

### Files to Modify

1. **src/components/Hero.astro**
   - Add hero image with fetchpriority="high"
   - Include width/height attributes

2. **src/components/PostCard.astro**
   - Remove lazy loading from first 2 cards
   - Keep lazy loading for rest

3. **src/pages/index.astro**
   - Pass index to PostCard for conditional lazy loading

### Implementation

```astro
<!-- src/components/PostCard.astro -->
---
interface Props {
  post: CollectionEntry<"blog">;
  index?: number;
}
const { post, index = 999 } = Astro.props;
const shouldLazyLoad = index > 1; // First 2 cards load eagerly
---

<Image
  src={post.data.heroImage}
  alt={post.data.title}
  width={600}
  height={450}
  format="webp"
  quality={80}
  loading={shouldLazyLoad ? "lazy" : "eager"}
  fetchpriority={index === 0 ? "high" : "auto"}
/>
```

### Acceptance Criteria

- [ ] Hero/featured images load eagerly
- [ ] First image has fetchpriority="high"
- [ ] Below-fold images remain lazy loaded
- [ ] All images have width/height attributes
- [ ] LCP element loads faster

### Verification

```bash
# Build and check image attributes
deno task build
grep -c 'loading="eager"' dist/index.html # Should be >= 2
grep -c 'fetchpriority="high"' dist/index.html # Should be >= 1
grep -c 'width=' dist/index.html # All images should have width
```

---

## Step 6: Add Resource Hints

### Files to Modify

1. **src/components/Head.astro**
   - Add DNS prefetch for external domains
   - Preload critical resources
   - Add preconnect for critical origins

### Implementation

```astro
<!-- src/components/Head.astro -->
<head>
  <!-- DNS Prefetch for external resources -->
  <link rel="dns-prefetch" href="https://cdn.example.com" />
  
  <!-- Preconnect for critical origins -->
  <link rel="preconnect" href="https://critical-api.example.com" />
  
  <!-- Preload critical resources -->
  <link rel="preload" href="/_astro/main.*.js" as="script" />
  <link rel="preload" href="/hero-image.webp" as="image" type="image/webp" />
</head>
```

### Acceptance Criteria

- [ ] Resource hints added for external domains
- [ ] Critical resources preloaded
- [ ] No unused preloads (check DevTools Console)
- [ ] Preload scanner discovers resources early

### Verification

```bash
# Check resource hints in HTML
deno task build
grep -c "rel=\"preload\"" dist/index.html
grep -c "rel=\"dns-prefetch\"" dist/index.html

# Verify in DevTools Network tab:
# - Resources load in parallel
# - No preload warnings in console
```

---

## Step 7: Build Configuration

### Files to Modify

1. **astro.config.mjs**
   - Enable HTML/CSS minification
   - Configure image optimization
   - Set up proper caching headers

### Implementation

```javascript
// astro.config.mjs
export default defineConfig({
  build: {
    inlineStylesheets: 'auto', // Inline small CSS
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

### Acceptance Criteria

- [ ] HTML output is minified
- [ ] CSS is minified and optimized
- [ ] Build size reduced by > 20%
- [ ] Source maps available in dev only

### Verification

```bash
# Compare build sizes
deno task build
du -sh dist/

# Check minification
head dist/index.html # Should be minified
```

---

## Step 8: Testing & Validation

### Testing Checklist

1. **Performance Testing**
   - [ ] Run Lighthouse audit (score > 90)
   - [ ] Test with WebPageTest
   - [ ] Verify Core Web Vitals improved

2. **Cross-browser Testing**
   - [ ] Chrome/Edge - Full functionality
   - [ ] Firefox - Full functionality
   - [ ] Safari - Full functionality
   - [ ] Mobile browsers - Responsive and fast

3. **Resource Loading**
   - [ ] Waterfall shows parallel loading
   - [ ] No render-blocking resources
   - [ ] Preload scanner working efficiently
   - [ ] No console warnings about unused preloads

4. **Visual Testing**
   - [ ] No FOUT (Flash of Unstyled Text)
   - [ ] No FOUC (Flash of Unstyled Content)
   - [ ] No layout shifts (CLS < 0.1)
   - [ ] Images load progressively

### Final Verification Commands

```bash
# Full test suite
deno task check-all
deno task test

# Build and preview
deno task build
deno task preview

# Manual testing checklist:
# 1. Clear cache and hard reload
# 2. Check Network tab - resources load in parallel
# 3. Check Coverage tab - no unused CSS
# 4. Check Console - no errors or warnings
# 5. Run Lighthouse - score > 90
```

---

## Success Metrics

### Target Improvements

- **FCP**: < 1.5s (from ~2.2s)
- **LCP**: < 2.0s (from ~3.5s)
- **CLS**: < 0.05 (from ~0.15)
- **TTI**: < 3.0s (from ~4.5s)
- **Lighthouse Score**: > 95 (from ~75)

### Rollback Plan

If issues occur:

1. Revert font changes - restore Google Fonts
2. Remove preload hints if causing issues
3. Restore original image loading attributes
4. Keep git history clean for easy reversion

---

## Implementation Order

1. **Phase 1**: Font optimization (Steps 2-3)
2. **Phase 2**: CSS optimization (Step 4)
3. **Phase 3**: Image optimization (Step 5)
4. **Phase 4**: Resource hints (Step 6)
5. **Phase 5**: Build config (Step 7)
6. **Phase 6**: Testing (Step 8)

Each phase should be committed separately for easy rollback if needed.

## Notes for Implementing Agents

- Test after EVERY change
- Commit working code frequently
- Document any deviations from plan
- Report metrics before/after each phase
- Ask for clarification if acceptance criteria unclear
