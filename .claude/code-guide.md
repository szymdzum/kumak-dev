# Kumak's Blog Code Style Guide

> A pragmatic style guide for building with Astro, TypeScript, and Deno

## Core Principles

1. **Web Standards First** - Use native APIs before libraries
2. **Semantic HTML** - Use proper elements, not `<div>` soup
3. **TypeScript Strict** - No `any` types allowed
4. **Accessibility** - WCAG AA compliance required
5. **Performance** - Ship fast, load faster

## Layout Architecture

### CSS Grid Layout

```css
/* Sticky footer pattern */
body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
}
```

### Structural Selectors

```css
/* Prefer semantic structure over classes */
body > header              /* Site header */
header nav                 /* Main navigation */  
nav a[aria-current="page"] /* Active state */
body > footer              /* Site footer */
footer nav                 /* Social navigation */
```

### Component Rules

- **Layout components**: No `<style>` tags, use global.css
- **Content components**: Scoped styles allowed
- **Classes**: Only utilities (`.container`, `.visually-hidden`)

## TypeScript Conventions

```typescript
// ✅ GOOD: Explicit interfaces
export interface BlogPost {
  readonly title: string
  readonly slug: string
  readonly pubDate: Date
  readonly tags?: readonly string[]
}

// ✅ GOOD: Descriptive names
const publishedBlogPosts = posts.filter((post) => !post.isDraft)

// ❌ BAD: Any types or unclear names
const data: any = await fetch()
const psts = posts.filter((p) => !p.d)
```

## Astro Component Structure

### Layout Components

```astro
---
import Navigation from "./Navigation.astro";
---

<header>
  <div class="container">
    <Navigation />
  </div>
</header>

<!-- No <style> tag - styled globally -->
```

### Content Components

```astro
---
export interface Props {
  readonly title: string;
  readonly description?: string;
}

const { title, description } = Astro.props;
---

<article>
  <h1>{title}</h1>
  {description && <p>{description}</p>}
</article>

<style>
  /* Component-specific styles allowed */
  article {
    padding: var(--space-lg);
    max-width: var(--content-width);
  }
</style>
```

## CSS Architecture

### Design Tokens

```css
/* ✅ GOOD: Use design tokens */
.component {
  padding: var(--space-md);
  color: var(--color-text);
  font-size: var(--text-base);
}

/* ❌ BAD: Magic numbers */
.component {
  padding: 16px;
  color: #111111;
  font-size: 14px;
}
```

### Cascade & Inheritance

```css
/* ✅ GOOD: Leverage inheritance */
body > footer {
  color: var(--color-text-muted); /* Inherited by children */
}

body > footer p {
  margin: 0; /* Only override what's needed */
}
```

## PostsManager Usage

```typescript
// ✅ GOOD: Use utility for content queries
const featuredPosts = PostsManager.getFeatured(allPosts, 3)
const latestPosts = PostsManager.getLatest(allPosts, 5)

// ❌ BAD: Manual filtering
const featured = allPosts.filter((p) => p.data.featured).slice(0, 3)
```

## Quality Checklist

### Required Checks

- [ ] `deno task check-all` passes
- [ ] No `any` types used
- [ ] Semantic HTML structure
- [ ] Layout styles in global.css only
- [ ] Structural selectors used

### Best Practices

- [ ] Design tokens used
- [ ] Descriptive variable names
- [ ] JSDoc for complex functions
- [ ] WCAG AA compliance
- [ ] Performance considered

## Anti-Patterns

```css
/* ❌ BAD: BEM methodology */
.header__content {}
.nav__item--active {}

/* ✅ GOOD: Semantic selectors */
header .container {}
nav a[aria-current='page'] {}
```

```astro
<!-- ❌ BAD: Layout styles in components -->
<header class="site-header">
  <Navigation />
</header>
<style>
  .site-header { position: sticky; }
</style>

<!-- ✅ GOOD: Clean semantic markup -->
<header>
  <div class="container">
    <Navigation />
  </div>
</header>
```

This style guide is a living document. Update as patterns evolve.
