# Semantic HTML Grid Layout Implementation Plan

## Issue #4: Implement Holy Grail Layout with CSS Grid

> A step-by-step guide to implement a semantic HTML5 grid layout system using the Holy Grail pattern with semantic selectors

---

## Overview

Implement a classic Holy Grail layout using CSS Grid with semantic HTML5 elements. This creates a flexible three-column layout with header and footer that works responsively, using semantic selectors instead of classes.

### Layout Structure

```
┌────────────────────────────────┐
│           Header               │
├────┬──────────────────┬────────┤
│    │                  │        │
│ L  │   Main Content   │   R    │
│ e  │                  │   i    │
│ f  │                  │   g    │
│ t  │                  │   h    │
│    │                  │   t    │
├────┴──────────────────┴────────┤
│           Footer               │
└────────────────────────────────┘
```

---

## ITERATION 1: Create BaseLayout Foundation

**Duration:** 10 minutes\
**Files to create:** `src/layouts/BaseLayout.astro`

### Steps:

1. Create new file `src/layouts/BaseLayout.astro`
2. Implement basic HTML5 document structure
3. Import existing Head component
4. Set up props interface

### Code to implement:

```astro
---
import Head from "@components/Head.astro";

export interface Props {
  title?: string;
  description?: string;
  image?: string;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
}

const { 
  title, 
  description, 
  image,
  showLeftSidebar = false,
  showRightSidebar = false
} = Astro.props;
---

<!doctype html>
<html lang="en">
  <Head title={title} description={description} image={image} />
  <body>
    <slot />
  </body>
</html>
```

### Validation:

- [ ] File created successfully
- [ ] Run `deno task dev` - no errors
- [ ] Page loads in browser

---

## ITERATION 2: Add Semantic HTML Structure

**Duration:** 15 minutes\
**Files to modify:** `src/layouts/BaseLayout.astro`

### Steps:

1. Import Header and Footer components
2. Add semantic HTML5 structure with data attributes
3. Implement grid container without classes
4. Add skip-to-content link for accessibility

### Code to implement:

```astro
---
import Head from "@components/Head.astro";
import Header from "@components/Header.astro";
import Footer from "@components/Footer.astro";

export interface Props {
  title?: string;
  description?: string;
  image?: string;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
}

const { 
  title, 
  description, 
  image,
  showLeftSidebar = false,
  showRightSidebar = false
} = Astro.props;

// Build data attribute for layout type
const layoutType = [
  showLeftSidebar && 'has-left-sidebar',
  showRightSidebar && 'has-right-sidebar'
].filter(Boolean).join(' ') || 'single-column';
---

<!doctype html>
<html lang="en">
  <Head title={title} description={description} image={image} />
  <body data-layout={layoutType}>
    <a href="#main-content" data-skip-link aria-label="Skip to main content">
      Skip to content
    </a>
    
    <Header />
    
    {showLeftSidebar && (
      <aside data-sidebar="left" aria-label="Complementary content">
        <slot name="left-sidebar" />
      </aside>
    )}
    
    <main id="main-content" tabindex="-1">
      <slot />
    </main>
    
    {showRightSidebar && (
      <aside data-sidebar="right" aria-label="Table of contents">
        <slot name="right-sidebar" />
      </aside>
    )}
    
    <Footer />
  </body>
</html>
```

### Validation:

- [ ] Semantic elements in place
- [ ] Conditional sidebars work
- [ ] Skip link present
- [ ] Data attributes set correctly
- [ ] Run `deno task dev` - layout renders

---

## ITERATION 3: Implement CSS Grid with Semantic Selectors

**Duration:** 20 minutes\
**Files to create:** `src/styles/grid.css`
**Files to modify:** `src/layouts/BaseLayout.astro`

### Steps:

1. Create `src/styles/grid.css` using semantic selectors
2. Target elements by tag, role, and data attributes
3. Add responsive behavior
4. Import styles in BaseLayout.astro

### CSS to implement (`src/styles/grid.css`):

```css
/* ===========================
   Grid Layout System
   Using semantic selectors only
   =========================== */

/* Base grid setup - target body with layout attribute */
body[data-layout] {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr;
  min-height: 100vh;
  margin: 0;
}

/* Three-column layout when sidebars present */
body[data-layout*='sidebar'] {
  grid-template-columns: auto 1fr auto;
}

/* Header - spans full width */
body > header {
  grid-column: 1 / -1;
  grid-row: 1;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--color-bg);
  border-bottom: var(--border-width) solid var(--color-border);
}

/* Main content */
body > main {
  grid-row: 2;
  padding: var(--space-lg) var(--container-padding);
  width: 100%;
  max-width: var(--content-width);
  margin-inline: auto;
}

/* Main in single column layout */
body[data-layout='single-column'] > main {
  grid-column: 1;
}

/* Main with sidebars */
body[data-layout*='sidebar'] > main {
  grid-column: 2;
}

/* Sidebar styling */
aside[data-sidebar] {
  grid-row: 2;
  padding: var(--space-lg) var(--space-md);
  background: var(--color-bg-subtle);
  overflow-y: auto;
  max-height: calc(100vh - var(--header-height));
}

/* Left sidebar */
aside[data-sidebar='left'] {
  grid-column: 1;
  border-right: var(--border-width) solid var(--color-border);
}

/* Right sidebar */
aside[data-sidebar='right'] {
  grid-column: 3;
  border-left: var(--border-width) solid var(--color-border);
}

/* Footer - spans full width */
body > footer {
  grid-column: 1 / -1;
  grid-row: 3;
  margin-top: var(--space-2xl);
  border-top: var(--border-width) solid var(--color-border);
}

/* Skip link (accessibility) */
a[data-skip-link] {
  position: absolute;
  transform: translateY(-100%);
  left: var(--space-md);
  top: var(--space-md);
  z-index: var(--z-modal);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary);
  color: var(--color-bg);
  text-decoration: none;
  border-radius: var(--radius);
  font-weight: var(--font-weight-semibold);
  transition: transform var(--transition-fast);
}

a[data-skip-link]:focus {
  transform: translateY(0);
}

/* Focus management */
main:focus {
  outline: none;
}

main:focus-visible {
  outline: var(--border-width-thick) solid var(--color-primary);
  outline-offset: calc(var(--space-xs) * -1);
}

/* ===========================
   Mobile Layout
   Stack everything vertically
   =========================== */

@media (max-width: 60rem) {
  /* Reset to single column on mobile */
  body[data-layout*='sidebar'] {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto auto;
  }

  /* Stack order on mobile */
  body > header {
    grid-column: 1;
    grid-row: 1;
  }

  /* Left sidebar comes after header on mobile */
  aside[data-sidebar='left'] {
    grid-column: 1;
    grid-row: 2;
    border-right: none;
    border-bottom: var(--border-width) solid var(--color-border);
    max-height: none;
  }

  /* Main content */
  body > main {
    grid-column: 1;
    grid-row: 3;
  }

  /* Right sidebar after main */
  aside[data-sidebar='right'] {
    grid-column: 1;
    grid-row: 4;
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
    max-height: none;
  }

  /* Footer at bottom */
  body > footer {
    grid-column: 1;
    grid-row: 5;
  }

  /* Adjust main when no sidebars */
  body[data-layout='single-column'] > main {
    grid-row: 2;
  }

  body[data-layout='single-column'] > footer {
    grid-row: 3;
  }
}

/* ===========================
   Desktop Enhancements
   =========================== */

@media (min-width: 60rem) {
  /* Sidebar width constraints */
  aside[data-sidebar] {
    width: clamp(12rem, 20vw, 18rem);
  }

  /* Sticky sidebar content */
  aside[data-sidebar] > * {
    position: sticky;
    top: calc(var(--header-height) + var(--space-lg));
  }
}

/* ===========================
   Print Styles
   =========================== */

@media print {
  /* Hide sidebars and navigation in print */
  aside[data-sidebar],
  a[data-skip-link],
  body > header,
  body > footer {
    display: none;
  }

  /* Full width main content for print */
  body > main {
    grid-column: 1 / -1;
    max-width: 100%;
    padding: 0;
  }
}

/* ===========================
   Utility: Hide sidebars on specific pages
   =========================== */

/* Hide empty sidebars */
aside[data-sidebar]:empty {
  display: none;
}

/* Adjust grid when sidebar is hidden */
body[data-layout*='left-sidebar']:has(aside[data-sidebar='left']:empty) {
  grid-template-columns: 1fr auto;
}

body[data-layout*='right-sidebar']:has(aside[data-sidebar='right']:empty) {
  grid-template-columns: auto 1fr;
}

/* Both sidebars empty = single column */
body[data-layout*='sidebar']:has(aside[data-sidebar]:empty):has(aside[data-sidebar]:empty) {
  grid-template-columns: 1fr;
}
```

### Add import in BaseLayout.astro:

```astro
---
import Head from "@components/Head.astro";
import Header from "@components/Header.astro";
import Footer from "@components/Footer.astro";
import "@styles/grid.css";
// ... rest of imports
---
```

### Validation:

- [ ] Grid layout displays correctly
- [ ] Mobile stacking works
- [ ] Desktop three-column layout works
- [ ] Skip link visible on focus
- [ ] No class selectors used in grid.css
- [ ] Run `deno task check-all`

---

## ITERATION 4: Update Layout.astro

**Duration:** 10 minutes\
**Files to modify:** `src/layouts/Layout.astro`

### Steps:

1. Import BaseLayout
2. Refactor to extend BaseLayout
3. Remove duplicate imports
4. Pass through slots

### Code to implement:

```astro
---
import BaseLayout from './BaseLayout.astro';

export interface Props {
  title?: string;
  description?: string;
  image?: string;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
}

const { title, description, image, showLeftSidebar, showRightSidebar } = Astro.props;
---

<BaseLayout 
  title={title} 
  description={description} 
  image={image}
  showLeftSidebar={showLeftSidebar}
  showRightSidebar={showRightSidebar}
>
  <slot />
  <slot name="left-sidebar" slot="left-sidebar" />
  <slot name="right-sidebar" slot="right-sidebar" />
</BaseLayout>
```

### Validation:

- [ ] Existing pages still work
- [ ] No visual regressions
- [ ] Props passed correctly
- [ ] Run `deno task build`

---

## ITERATION 5: Create BlogPost Layout with Sidebars

**Duration:** 15 minutes\
**Files to modify:** `src/layouts/BlogPost.astro`

### Steps:

1. Update BlogPost layout to use BaseLayout
2. Add table of contents to right sidebar
3. Add metadata to left sidebar
4. Use semantic HTML for sidebar content

### Example implementation:

```astro
---
// ... existing imports
import BaseLayout from './BaseLayout.astro';

// ... existing props
---

<BaseLayout 
  title={title} 
  description={description}
  showLeftSidebar={true}
  showRightSidebar={headings && headings.length > 0}
>
  <article class="article">
    {heroImage && (
      <figure>
        <img src={heroImage} alt={title} />
      </figure>
    )}

    <header>
      <div data-article-meta>
        <span>{category}</span>
        {draft && import.meta.env.DEV && (
          <span data-badge="draft">DRAFT</span>
        )}
        <span aria-hidden="true">•</span>
        <time datetime={pubDate.toISOString().split('T')[0]}>
          <FormattedDate date={pubDate} />
        </time>
        <span aria-hidden="true">•</span>
        <span data-reading-time>{readingTime}</span>
      </div>

      <h1>{title}</h1>
      <p>{description}</p>

      {tags && tags.length > 0 && (
        <nav aria-label="Article tags">
          {tags.map((tag: string) => (
            <span data-tag>#{tag}</span>
          ))}
        </nav>
      )}

      {updatedDate && (
        <div data-updated>
          <time datetime={updatedDate.toISOString().split('T')[0]}>
            Last updated: <FormattedDate date={updatedDate} />
          </time>
        </div>
      )}
    </header>

    <div data-article-content>
      <slot />
    </div>
  </article>
  
  <nav slot="left-sidebar" aria-label="Article information">
    <h2>Article Info</h2>
    <dl>
      <dt>Published</dt>
      <dd><FormattedDate date={pubDate} /></dd>
      
      <dt>Reading time</dt>
      <dd>{readingTime}</dd>
      
      <dt>Category</dt>
      <dd>{category}</dd>
      
      {tags && tags.length > 0 && (
        <>
          <dt>Tags</dt>
          <dd>
            <ul role="list">
              {tags.map((tag: string) => (
                <li>{tag}</li>
              ))}
            </ul>
          </dd>
        </>
      )}
    </dl>
  </nav>
  
  {headings && headings.length > 0 && (
    <nav slot="right-sidebar" aria-label="Table of contents">
      <h2>On this page</h2>
      <ol role="list">
        {headings.map(({ slug, text, depth }) => (
          <li data-toc-level={depth}>
            <a href={`#${slug}`}>{text}</a>
          </li>
        ))}
      </ol>
    </nav>
  )}
</BaseLayout>
```

### Additional CSS for BlogPost (add to existing styles):

```css
/* Table of contents depth styling */
[data-toc-level='3'] {
  margin-inline-start: var(--space-md);
}

[data-toc-level='4'] {
  margin-inline-start: var(--space-lg);
}

/* Article metadata styling */
[data-article-meta] {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* Tag styling */
[data-tag] {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
}
```

### Validation:

- [ ] Blog posts display with sidebars
- [ ] Table of contents works
- [ ] Metadata displays correctly
- [ ] Mobile layout stacks properly
- [ ] Semantic HTML used throughout

---

## ITERATION 6: Add Semantic Utility Styles

**Duration:** 10 minutes\
**Files to modify:** `src/styles/global.css`

### Steps:

1. Add semantic element styles
2. Add ARIA-based styles
3. Add responsive utilities using data attributes

### CSS to add:

```css
/* ===========================
   Semantic Element Styles
   =========================== */

/* Article elements */
article {
  max-width: var(--content-width);
}

article > header {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: var(--border-width) solid var(--color-border);
}

article > header h1 {
  margin-bottom: var(--space-md);
}

/* Navigation lists */
nav[aria-label] ul,
nav[aria-label] ol {
  list-style: none;
  padding: 0;
  margin: 0;
}

nav[aria-label] li {
  margin-bottom: var(--space-xs);
}

/* Definition lists in sidebars */
aside dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-xs) var(--space-md);
}

aside dt {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
}

aside dd {
  margin: 0;
}

/* Sticky sidebar content */
aside > nav {
  position: sticky;
  top: calc(var(--header-height) + var(--space-lg));
}

/* ===========================
   Data Attribute Utilities
   =========================== */

/* Hidden on mobile */
[data-hide='mobile'] {
  @media (max-width: 60rem) {
    display: none;
  }
}

/* Hidden on desktop */
[data-hide='desktop'] {
  @media (min-width: 60rem) {
    display: none;
  }
}

/* Badge styling */
[data-badge] {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

[data-badge='draft'] {
  background: var(--color-accent);
  color: var(--color-bg);
}

/* ===========================
   ARIA-based Styles
   =========================== */

/* Current page indicator */
[aria-current='page'] {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

/* Disabled state */
[aria-disabled='true'] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Hidden but accessible */
[aria-hidden='true'] {
  user-select: none;
}

/* Loading state */
[aria-busy='true'] {
  position: relative;
  pointer-events: none;
}

[aria-busy='true']::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgb(var(--color-bg-rgb) / 0.7);
}
```

### Validation:

- [ ] Semantic styles apply correctly
- [ ] Data attribute utilities work
- [ ] ARIA styles function properly
- [ ] No conflicts with existing styles

---

## ITERATION 7: Testing & Documentation

**Duration:** 15 minutes\
**Files:** All modified files

### Testing Checklist:

- [ ] **Keyboard Navigation**
  - Tab order: skip link → header nav → main → left sidebar → right sidebar → footer
  - Skip link focuses main content
  - All interactive elements reachable

- [ ] **Screen Reader Testing**
  - Landmarks announced: banner, navigation, main, complementary, contentinfo
  - ARIA labels read correctly
  - Content structure logical

- [ ] **Responsive Testing**
  - 320px: Mobile stacked layout
  - 768px: Tablet view
  - 1200px: Full desktop with sidebars
  - 1920px: Wide screen layout

- [ ] **Browser Testing**
  - Chrome/Edge
  - Firefox
  - Safari

- [ ] **Performance**
  - No layout shift
  - Fast initial paint
  - Smooth scrolling

### Quality Checks:

```bash
deno task check-all  # Astro check + lint + format
deno task test       # Run tests
deno task build      # Production build
```

### HTML Validation:

- Check output at https://validator.w3.org/
- Verify proper nesting
- Confirm ARIA attributes are valid

### Add JSDoc Documentation:

```astro
---
/**
 * BaseLayout - Semantic HTML5 layout with CSS Grid
 * 
 * Implements Holy Grail pattern using only semantic selectors:
 * - No class names for layout (uses element, data-*, and ARIA selectors)
 * - Sticky header and footer
 * - Optional left and right sidebars
 * - Responsive stacking on mobile
 * - Full accessibility support
 * 
 * @param {string} title - Page title
 * @param {string} description - Page description  
 * @param {string} image - Social share image
 * @param {boolean} showLeftSidebar - Display left sidebar
 * @param {boolean} showRightSidebar - Display right sidebar
 * 
 * @slot default - Main content area
 * @slot left-sidebar - Left sidebar content
 * @slot right-sidebar - Right sidebar content
 * 
 * @example
 * <BaseLayout title="Article" showRightSidebar={true}>
 *   <article>Main content</article>
 *   <nav slot="right-sidebar" aria-label="Table of contents">
 *     <h2>Contents</h2>
 *     <ol>...</ol>
 *   </nav>
 * </BaseLayout>
 */
---
```

---

## Success Criteria

### Required Outcomes:

✅ Holy Grail layout with CSS Grid\
✅ Semantic HTML5 structure (no layout classes)\
✅ Selectors use elements, data-*, ARIA attributes\
✅ Responsive without complex media queries\
✅ Full accessibility (skip link, landmarks, labels)\
✅ Optional sidebars with slots\
✅ All existing pages work\
✅ No TypeScript errors\
✅ All checks pass

### Semantic Selector Requirements:

- ✅ No `.holy-grail` or similar layout classes
- ✅ Target by `body[data-layout]`
- ✅ Target by `aside[data-sidebar]`
- ✅ Target by `nav[aria-label]`
- ✅ Target by semantic elements: `header`, `main`, `footer`, `article`

### Performance Metrics:

- Bundle size increase < 3KB
- No layout shift (CLS = 0)
- Fast page load maintained

### Code Quality:

- Uses existing design tokens
- Follows project style guide
- No `any` TypeScript types
- Semantic, maintainable CSS

---

## Implementation Notes

### Key Principles:

1. **Semantic selectors only** - no layout classes like `.holy-grail`
2. **Progressive enhancement** - works without JavaScript
3. **Mobile-first** - base styles for mobile, enhance for desktop
4. **Accessibility first** - ARIA labels, skip links, focus management

### Selector Strategy:

```css
/* ✅ GOOD - Semantic selectors */
body[data-layout] {}
aside[data-sidebar='left'] {}
nav[aria-label] {}
article > header {}

/* ❌ BAD - Class-based layout */
.holy-grail {}
.sidebar-left {}
.layout-grid {}
```

### For the implementing agent:

1. **No layout classes** - use data attributes and semantic elements
2. **Test each iteration** - verify before moving forward
3. **Use existing components** - Header/Footer already exist
4. **Follow fluid design system** - use CSS variables
5. **Keep markup semantic** - proper HTML5 elements
6. __Document with data-_ attributes_* - self-documenting HTML

### Common Issues to Avoid:

- Don't add wrapper divs for layout
- Don't forget ARIA labels on nav elements
- Ensure data-layout attribute is set correctly
- Test empty sidebar behavior
- Maintain minimal aesthetic

### Resources:

- [Holy Grail Layout - web.dev](https://web.dev/patterns/layout/holy-grail)
- [Semantic HTML - MDN](https://developer.mozilla.org/en-US/docs/Glossary/Semantics)
- [ARIA Landmarks](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)

---

## Completion Checklist

After implementing all iterations:

- [ ] All 7 iterations completed
- [ ] No class-based layout selectors used
- [ ] All semantic selectors working
- [ ] Validation checks passed
- [ ] Success criteria met
- [ ] Documentation added
- [ ] Tests passing
- [ ] No console errors
- [ ] Responsive on all screens
- [ ] Accessible with keyboard/screen reader
- [ ] Ready for code review

**Estimated Total Time:** ~90 minutes

---

_This plan is for Issue #4: Implement Semantic HTML Grid Layout System using semantic selectors_
