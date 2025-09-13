# Semantic Grid Layout Implementation Plan

## CONTEXT

Implementing semantic HTML5 structure with CSS Grid sticky footer/header layout for Kumak's Blog

## REQUIREMENTS

1. Use CSS Grid for sticky footer layout
2. Implement sticky header
3. Use semantic HTML selectors (no BEM)
4. Style globally in global.css
5. Leverage CSS cascade
6. No skip link utility

## EXECUTION PLAN

### STEP 1: Add Global CSS Layout Styles

**File:** `/src/styles/global.css`

**Action:** Add the following CSS at the end of the file

```css
/* ===========================
   Layout Grid System
   =========================== */

/* Sticky footer with CSS Grid */
body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  min-height: 100dvh; /* Modern browsers */
  margin: 0;
}

/* ===========================
   Site Header (Sticky)
   =========================== */

body > header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background-color: var(--color-bg);
  border-bottom: var(--border-width) solid var(--color-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: box-shadow var(--transition-normal);
}

/* Dark mode transparency */
@media (prefers-color-scheme: dark) {
  body > header {
    background-color: rgb(var(--color-bg-rgb) / 0.95);
  }
}

/* Header container */
body > header .container {
  max-width: var(--content-width-wide);
  margin-inline: auto;
  padding-block: var(--space-md);
  padding-inline: var(--container-padding);
  min-height: var(--header-height);
  display: flex;
  align-items: center;
}

/* ===========================
   Main Navigation
   =========================== */

/* Navigation list */
header nav ul {
  display: flex;
  gap: var(--space-lg);
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
}

/* Navigation links */
header nav a {
  position: relative;
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
  border-radius: var(--radius-sm);
}

header nav a:hover {
  color: var(--color-text);
}

/* Active page indicator */
header nav a[aria-current='page'] {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

/* Active underline */
header nav a[aria-current='page']::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--space-sm);
  right: var(--space-sm);
  height: 2px;
  background-color: var(--color-primary);
  border-radius: var(--radius-sm);
}

/* Focus state */
header nav a:focus-visible {
  outline: var(--border-width-thick) solid var(--color-primary);
  outline-offset: 2px;
}

/* Mobile navigation */
@media (max-width: 40rem) {
  header nav ul {
    gap: var(--space-sm);
  }

  header nav a {
    padding: var(--space-xs);
    font-size: var(--text-sm);
  }
}

/* ===========================
   Main Content Area
   =========================== */

body > main {
  width: 100%;
  padding-block: var(--section-padding);
  padding-inline: var(--container-padding);
}

/* ===========================
   Site Footer
   =========================== */

body > footer {
  background-color: var(--color-bg-subtle);
  border-top: var(--border-width) solid var(--color-border);
  margin-top: auto;
}

body > footer .container {
  max-width: var(--content-width-wide);
  margin-inline: auto;
  padding-block: var(--space-xl);
  padding-inline: var(--container-padding);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-xl);
  align-items: center;
}

/* Footer text */
body > footer p {
  margin: 0;
  color: var(--color-text);
}

body > footer p + p {
  margin-top: var(--space-xs);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

/* Italic tagline */
body > footer em {
  font-style: italic;
}

/* ===========================
   Social Links (Footer nav)
   =========================== */

footer nav {
  display: flex;
  gap: var(--space-md);
}

footer nav a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-text-muted);
  border-radius: var(--radius);
  transition: all var(--transition-fast);
}

footer nav a:hover {
  color: var(--color-primary);
  background-color: rgb(var(--color-primary-rgb) / 0.1);
  transform: translateY(-2px);
}

footer nav a:focus-visible {
  outline: var(--border-width-thick) solid var(--color-primary);
  outline-offset: 2px;
}

/* ===========================
   Responsive Layout
   =========================== */

@media (max-width: 40rem) {
  body > footer .container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: var(--space-lg);
  }

  footer nav {
    justify-content: center;
  }
}

/* ===========================
   Layout Custom Properties
   =========================== */

:root {
  --header-height: clamp(3.5rem, 8vh, 5rem);
}

/* Smooth scrolling */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

**Verification:** After adding, run `deno task check-all` to ensure no CSS errors

---

### STEP 2: Update BaseLayout.astro

**File:** `/src/layouts/BaseLayout.astro`

**Current State:**

```astro
<body>
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
</body>
```

**Change To:**

```astro
<body>
  <Header />
  <main id="main-content">
    <slot />
  </main>
  <Footer />
</body>
```

**What Changed:**

- Added `id="main-content"` to main element for potential anchor links

**Remove:** Any `<style>` tags if present in this file

---

### STEP 3: Update Header.astro

**File:** `/src/components/Header.astro`

**Current State:**

```astro
<header>
  <div class="header-content">
    <Navigation />
  </div>
</header>
```

**Change To:**

```astro
<header>
  <div class="container">
    <Navigation />
  </div>
</header>
```

**What Changed:**

- Changed `class="header-content"` to `class="container"` (reuse existing utility)

**Remove:** Any `<style>` tags if present in this file

---

### STEP 4: Update Navigation.astro

**File:** `/src/components/Navigation.astro`

**Keep Existing Logic, Update Only:**

1. Ensure `aria-current` is properly set:

```astro
<a 
  href={href}
  aria-current={isPathActive(currentPath, href) ? "page" : undefined}
>
  {title}
</a>
```

2. Ensure `role="list"` is on the `ul`:

```astro
<ul role="list">
```

**Remove:** Any `<style>` tags if present in this file

---

### STEP 5: Update Footer.astro

**File:** `/src/components/Footer.astro`

**Replace Current Content With:**

```astro
---
import { siteConfig } from "@/site-config";
const currentYear = new Date().getFullYear();
---

<footer>
  <div class="container">
    <div>
      <p>© {currentYear} {siteConfig.author}. Built with Astro and CSS.</p>
      <p><em>{siteConfig.tagline}</em></p>
    </div>
    
    <nav aria-label="Social media">
      {Object.entries(siteConfig.socials).map(([key, social]) => (
        <a 
          href={social.url} 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label={`${siteConfig.author} on ${social.name}`}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            aria-hidden="true"
            set:html={social.icon}
          />
        </a>
      ))}
    </nav>
  </div>
</footer>
```

**What Changed:**

- Added semantic structure with div wrapper
- Added social links as nav with SVG icons
- Used `<em>` for tagline
- Added proper ARIA labels

**Remove:** Any `<style>` tags if present

---

### STEP 6: Test Implementation

**Run these commands in order:**

```bash
# 1. Check for syntax errors
deno task check-all

# 2. Build the project
deno task build

# 3. Preview locally
deno task preview
```

**Manual Testing Checklist:**

- [ ] Open site in browser
- [ ] Verify header sticks to top when scrolling
- [ ] Verify footer stays at bottom on short pages
- [ ] Check navigation active state highlights current page
- [ ] Test on mobile viewport (responsive)
- [ ] Test dark mode toggle (if implemented)
- [ ] Tab through all interactive elements
- [ ] Verify no layout shift on page load

---

### STEP 7: Cross-Browser Testing

Test in these browsers:

1. **Chrome/Edge**: Latest version
2. **Firefox**: Latest version
3. **Safari**: If on Mac
4. **Mobile**: Resize browser to 375px width

**What to Check:**

- Sticky header works
- Footer at bottom
- Navigation readable
- Social icons visible
- No horizontal scroll

---

## TROUBLESHOOTING

### If header doesn't stick:

Check that `body > header` selector matches your HTML structure

### If footer doesn't stick to bottom:

Ensure body has `min-height: 100vh` and grid-template-rows

### If styles don't apply:

1. Clear browser cache
2. Check selector specificity
3. Verify global.css is imported in Head.astro

### If navigation breaks on mobile:

Check flex-wrap is applied to nav ul

---

## ROLLBACK PROCEDURE

If something breaks:

```bash
# Option 1: Revert only CSS
git checkout HEAD -- src/styles/global.css

# Option 2: Revert all changes
git reset --hard HEAD

# Option 3: Keep HTML changes, remove CSS
# Just delete the added CSS sections from global.css
```

---

## SUCCESS CRITERIA

Implementation is complete when:

- ✅ Footer sticks to bottom on all pages
- ✅ Header remains visible when scrolling
- ✅ Navigation shows active page
- ✅ Layout responsive on mobile
- ✅ No console errors
- ✅ Passes `deno task check-all`
- ✅ Works in Chrome, Firefox, Safari

---

## NOTES FOR AGENT

1. **DO NOT** create new CSS files - add everything to global.css
2. **DO NOT** use BEM naming (no `header__content` or `nav--active`)
3. **DO NOT** add data attributes unless absolutely necessary
4. **PRESERVE** all existing functionality
5. **TEST** after each step before proceeding
6. **COMMIT** after successful testing

---

**END OF PLAN - Ready for implementation**
