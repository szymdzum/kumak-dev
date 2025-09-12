# Blog Implementation Plan - The Null Hypothesis

## Overview

Complete implementation plan for fixing and enhancing the blog at https://kumak-blog-w29fw24n0jtv.deno.dev/

---

## Phase 1: Critical Bug Fixes

### ISSUE-001: Fix Blog Post 404 Routing

**CONTEXT:** Blog post links from /blog page lead to 404 errors

**TASK:** Fix blog post URL routing and generation

**REQUIREMENTS:**

1. Write tests for blog post URL generation
2. Fix slug generation in `src/pages/blog/[...slug].astro`
3. Ensure getStaticPaths() generates correct paths
4. Verify markdown files generate proper URLs
5. Test all blog post links work

**TEST FIRST:**

```typescript
// tests/integration/routing.test.ts
Deno.test('Blog post URLs should resolve correctly', async () => {
  const posts = [
    { file: 'markdown-style-guide.md', expectedUrl: '/blog/markdown-style-guide' },
    { file: 'using-mdx.mdx', expectedUrl: '/blog/using-mdx' },
  ]
  // Test URL generation logic
})
```

**FILES TO MODIFY:**

- `src/pages/blog/[...slug].astro`
- `src/content/config.ts` (if slug field needs adjustment)
- `tests/integration/routing.test.ts` (new)

**SUCCESS CRITERIA:**

- [ ] All blog post links return 200 status
- [ ] URLs match expected pattern: `/blog/[slug]`
- [ ] Both .md and .mdx files route correctly
- [ ] Tests pass for URL generation

**EDGE CASES:**

- Special characters in slugs
- MDX vs MD file extensions
- Duplicate slug handling

---

### ISSUE-002: Remove Placeholder Project Links

**CONTEXT:** Several project links point to non-existent repositories

**TASK:** Update all placeholder URLs with real links or remove them

**REQUIREMENTS:**

1. Audit all project URLs in site-config.ts
2. Remove or update placeholder links
3. Validate all remaining links
4. Add test for link validation

**TEST FIRST:**

```typescript
// tests/unit/projectLinks.test.ts
Deno.test('All project links should be valid URLs', () => {
  featuredProjects.forEach((project) => {
    assert(project.githubUrl.startsWith('https://github.com/'))
    assert(!project.githubUrl.includes('username'))
    if (project.demoUrl) {
      assert(!project.demoUrl.includes('demo-url.com'))
    }
  })
})
```

**FILES TO MODIFY:**

- `src/site-config.ts`
- `tests/unit/projectLinks.test.ts` (new)

**SUCCESS CRITERIA:**

- [ ] No placeholder URLs remain
- [ ] All GitHub links are valid
- [ ] Demo URLs either valid or removed
- [ ] Link validation test passes

---

## Phase 2: Core Features

### ISSUE-003: Implement Reading Time

**CONTEXT:** Blog posts lack reading time indicators

**TASK:** Add reading time calculation and display

**REQUIREMENTS:**

1. Create reading time utility function
2. Calculate reading time for each post
3. Display on blog cards
4. Display on post pages
5. Write comprehensive tests

**TEST FIRST:**

```typescript
// tests/unit/readingTime.test.ts
Deno.test('Reading time calculation', async (t) => {
  await t.step('should calculate 1 min for 200 words', () => {
    const content = 'word '.repeat(200)
    assertEquals(calculateReadingTime(content), 1)
  })

  await t.step('should round up for partial minutes', () => {
    const content = 'word '.repeat(250)
    assertEquals(calculateReadingTime(content), 2)
  })
})
```

**FILES TO MODIFY:**

- `src/utils/readingTime.ts` (create/update)
- `src/components/PostCard.astro`
- `src/pages/blog/[...slug].astro`
- `src/layouts/BlogPost.astro`
- `tests/unit/readingTime.test.ts` (new)

**SUCCESS CRITERIA:**

- [ ] Reading time displays on all blog cards
- [ ] Reading time displays on post pages
- [ ] Calculation is accurate (200-250 words/min)
- [ ] All tests pass

---

### ISSUE-004: Display Tags and Categories

**CONTEXT:** Tags exist in frontmatter but aren't displayed

**TASK:** Show tags on blog cards and implement filtering

**REQUIREMENTS:**

1. Display tags on PostCard component
2. Style tags consistently
3. Add category badges
4. Implement click-to-filter (optional)
5. Write tests for tag display

**TEST FIRST:**

```typescript
// tests/integration/tags.test.ts
Deno.test('Tags should be displayed and functional', async (t) => {
  await t.step('PostCard should render all tags', () => {
    const post = { tags: ['TypeScript', 'Testing'] }
    // Test tag rendering
  })

  await t.step('Tag filtering should work', () => {
    // Test filtering logic
  })
})
```

**FILES TO MODIFY:**

- `src/components/PostCard.astro`
- `src/components/Tags.astro`
- `src/pages/blog/index.astro`
- `tests/integration/tags.test.ts` (new)

**SUCCESS CRITERIA:**

- [ ] Tags visible on all blog cards
- [ ] Consistent tag styling
- [ ] Category badges display correctly
- [ ] Click-to-filter works (if implemented)
- [ ] Tests pass

---

### ISSUE-005: Implement RSS Feed

**CONTEXT:** No RSS/Atom feed for blog subscribers

**TASK:** Create RSS feed endpoint with all posts

**REQUIREMENTS:**

1. Create RSS endpoint
2. Include all published posts
3. Add autodiscovery link
4. Validate feed format
5. Write tests

**TEST FIRST:**

```typescript
// tests/integration/rss.test.ts
Deno.test('RSS feed generation', async (t) => {
  await t.step('should generate valid RSS XML', async () => {
    const response = await fetch('/rss.xml')
    const xml = await response.text()
    assert(xml.includes('<?xml version="1.0"'))
    assert(xml.includes('<rss version="2.0"'))
  })

  await t.step('should include all published posts', async () => {
    // Test post inclusion
  })
})
```

**FILES TO MODIFY:**

- `src/pages/rss.xml.js` (new)
- `src/layouts/BaseLayout.astro` (add autodiscovery)
- `src/components/Footer.astro` (add RSS link)
- `tests/integration/rss.test.ts` (new)

**SUCCESS CRITERIA:**

- [ ] RSS feed validates at /rss.xml
- [ ] All published posts included
- [ ] Autodiscovery link in HTML head
- [ ] RSS link in footer
- [ ] Feed validation tests pass

---

### ISSUE-006: Add Blog Post Navigation

**CONTEXT:** No navigation between blog posts

**TASK:** Implement previous/next navigation and back to blog link

**REQUIREMENTS:**

1. Add "← Back to Blog" link
2. Implement previous/next post links
3. Use PostsManager for adjacent posts
4. Style consistently
5. Write navigation tests

**TEST FIRST:**

```typescript
// tests/unit/postNavigation.test.ts
Deno.test('Post navigation', async (t) => {
  await t.step('should find previous and next posts', () => {
    const posts = [/* mock posts */]
    const current = posts[1]
    const { prev, next } = getAdjacentPosts(posts, current)
    assertEquals(prev, posts[0])
    assertEquals(next, posts[2])
  })
})
```

**FILES TO MODIFY:**

- `src/layouts/BlogPost.astro`
- `src/utils/postNavigation.ts` (new)
- `src/components/PostNavigation.astro` (new)
- `tests/unit/postNavigation.test.ts` (new)

**SUCCESS CRITERIA:**

- [ ] Back to Blog link on all posts
- [ ] Previous/Next links work correctly
- [ ] Navigation handles edge cases (first/last post)
- [ ] Styling matches site theme
- [ ] Tests pass

---

### ISSUE-007: Implement Search Functionality

**CONTEXT:** No search capability for blog content

**TASK:** Add client-side search with instant results

**REQUIREMENTS:**

1. Create search component
2. Implement search logic
3. Add to blog page header
4. Search titles, descriptions, tags
5. Write search tests

**TEST FIRST:**

```typescript
// tests/unit/search.test.ts
Deno.test('Search functionality', async (t) => {
  await t.step('should find posts by title', () => {
    const posts = [{ title: 'TypeScript Guide' }]
    const results = searchPosts(posts, 'typescript')
    assertEquals(results.length, 1)
  })

  await t.step('should search in tags', () => {
    // Test tag search
  })
})
```

**FILES TO MODIFY:**

- `src/components/Search.astro` (new)
- `src/utils/search.ts` (new)
- `src/pages/blog/index.astro`
- `tests/unit/search.test.ts` (new)

**SUCCESS CRITERIA:**

- [ ] Search bar on blog page
- [ ] Instant search results
- [ ] Searches title, description, tags
- [ ] Case-insensitive search
- [ ] All tests pass

---

### ISSUE-008: Add Pagination

**CONTEXT:** Blog page shows all posts without pagination

**TASK:** Implement pagination for blog listing

**REQUIREMENTS:**

1. Paginate at 6-10 posts per page
2. Add page navigation controls
3. Maintain URL structure
4. Use Astro pagination utilities
5. Write pagination tests

**TEST FIRST:**

```typescript
// tests/unit/pagination.test.ts
Deno.test('Pagination logic', async (t) => {
  await t.step('should paginate posts correctly', () => {
    const posts = Array(25).fill({}).map((_, i) => ({ id: i }))
    const page1 = paginatePosts(posts, 1, 10)
    assertEquals(page1.length, 10)
  })
})
```

**FILES TO MODIFY:**

- `src/pages/blog/[...page].astro` (new or modify)
- `src/components/Pagination.astro` (new)
- `src/utils/pagination.ts` (new)
- `tests/unit/pagination.test.ts` (new)

**SUCCESS CRITERIA:**

- [ ] Posts paginated at chosen limit
- [ ] Page navigation works
- [ ] URL structure preserved
- [ ] First/last page handling correct
- [ ] Tests pass

---

## Phase 3: Enhancements

### ISSUE-009: Fix Table of Contents

**CONTEXT:** TableOfContents component exists but doesn't render

**TASK:** Enable and fix table of contents display

**REQUIREMENTS:**

1. Debug why TOC isn't showing
2. Generate TOC from headings
3. Add smooth scroll
4. Show/hide based on post length
5. Write TOC tests

**TEST FIRST:**

```typescript
// tests/unit/tableOfContents.test.ts
Deno.test('Table of Contents generation', async (t) => {
  await t.step('should extract headings', () => {
    const content = '# H1\n## H2\n### H3'
    const toc = generateTOC(content)
    assertEquals(toc.length, 3)
  })
})
```

**FILES TO MODIFY:**

- `src/components/TableOfContents.astro`
- `src/layouts/BlogPost.astro`
- `src/utils/tocGenerator.ts` (new)
- `tests/unit/tableOfContents.test.ts` (new)

**SUCCESS CRITERIA:**

- [ ] TOC displays on long posts
- [ ] Smooth scroll to sections
- [ ] Correct heading hierarchy
- [ ] Responsive design
- [ ] Tests pass

---

### ISSUE-010: Create 404 Page

**CONTEXT:** No custom 404 error page

**TASK:** Design and implement 404 page

**REQUIREMENTS:**

1. Create custom 404 page
2. Add helpful navigation
3. Maintain site theme
4. Include search option
5. Test 404 behavior

**TEST FIRST:**

```typescript
// tests/integration/404.test.ts
Deno.test('404 page functionality', async () => {
  const response = await fetch('/non-existent-page')
  assertEquals(response.status, 404)
  const html = await response.text()
  assert(html.includes('Page not found'))
})
```

**FILES TO MODIFY:**

- `src/pages/404.astro` (new)
- `tests/integration/404.test.ts` (new)

**SUCCESS CRITERIA:**

- [ ] 404 page displays for invalid URLs
- [ ] Navigation links work
- [ ] Consistent styling
- [ ] Helpful message displayed
- [ ] Tests pass

---

### ISSUE-011: Implement Related Posts

**CONTEXT:** RelatedPosts component exists but not implemented

**TASK:** Show related posts on blog post pages

**REQUIREMENTS:**

1. Calculate post similarity
2. Display 3-5 related posts
3. Use tags/categories for matching
4. Style consistently
5. Write tests

**TEST FIRST:**

```typescript
// tests/unit/relatedPosts.test.ts
Deno.test('Related posts algorithm', async (t) => {
  await t.step('should find posts with common tags', () => {
    const current = { tags: ['TypeScript', 'Testing'] }
    const posts = [
      { tags: ['TypeScript'] },
      { tags: ['Python'] },
    ]
    const related = findRelatedPosts(current, posts, 3)
    assertEquals(related[0].tags[0], 'TypeScript')
  })
})
```

**FILES TO MODIFY:**

- `src/components/RelatedPosts.astro`
- `src/utils/relatedPosts.ts`
- `src/layouts/BlogPost.astro`
- `tests/unit/relatedPosts.test.ts` (new)

**SUCCESS CRITERIA:**

- [ ] Related posts display on post pages
- [ ] Algorithm finds relevant posts
- [ ] Handles posts with no relations
- [ ] Consistent styling
- [ ] Tests pass

---

### ISSUE-012: Add Social Sharing

**CONTEXT:** No social media sharing buttons on posts

**TASK:** Implement social sharing functionality

**REQUIREMENTS:**

1. Add share buttons for major platforms
2. Generate proper share URLs
3. Include post metadata
4. Style appropriately
5. Test share links

**TEST FIRST:**

```typescript
// tests/unit/socialSharing.test.ts
Deno.test('Social share URL generation', async (t) => {
  await t.step('should generate Twitter share URL', () => {
    const url = generateShareUrl('twitter', {
      title: 'Test Post',
      url: 'https://example.com/post',
    })
    assert(url.includes('twitter.com/intent/tweet'))
  })
})
```

**FILES TO MODIFY:**

- `src/components/ShareButtons.astro` (new)
- `src/utils/socialShare.ts` (new)
- `src/layouts/BlogPost.astro`
- `tests/unit/socialSharing.test.ts` (new)

**SUCCESS CRITERIA:**

- [ ] Share buttons on all posts
- [ ] Twitter/X, LinkedIn, others work
- [ ] Proper metadata included
- [ ] Accessible design
- [ ] Tests pass

---

## GitHub Issue Templates

### Issue Template Structure

````markdown
## 🎯 Objective

[One sentence description]

## 📋 Context

[Why this is needed]

## ✅ Acceptance Criteria

- [ ] Test files created and passing
- [ ] Feature implemented
- [ ] Documentation updated
- [ ] No regression in existing features
- [ ] Deployment successful

## 🧪 Test First Approach

```typescript
// Required tests before implementation
```
````

## 📁 Files to Modify

- [ ] File 1
- [ ] File 2

## ⚠️ Edge Cases

- Case 1
- Case 2

## 🔗 Dependencies

- Depends on: #ISSUE-XXX
- Blocks: #ISSUE-YYY

```
---

## Implementation Order

### Priority 1 (Day 1)
- ISSUE-001: Fix Blog Post 404 Routing
- ISSUE-002: Remove Placeholder Project Links

### Priority 2 (Day 2-3)
- ISSUE-003: Implement Reading Time
- ISSUE-004: Display Tags and Categories
- ISSUE-005: Implement RSS Feed
- ISSUE-006: Add Blog Post Navigation

### Priority 3 (Day 4-5)
- ISSUE-007: Implement Search Functionality
- ISSUE-008: Add Pagination
- ISSUE-009: Fix Table of Contents
- ISSUE-010: Create 404 Page

### Priority 4 (Week 2)
- ISSUE-011: Implement Related Posts
- ISSUE-012: Add Social Sharing

---

## Success Metrics

### Phase 1 Complete
- Zero 404 errors on content
- All links valid

### Phase 2 Complete
- Core blog features functional
- All tests passing
- User can discover and navigate content

### Phase 3 Complete
- Enhanced user experience
- Full feature parity with modern blogs
- Production ready

---

## Notes for Implementation

1. **Always write tests first** - TDD approach ensures quality
2. **Use existing utilities** - PostsManager, existing components
3. **Maintain theme consistency** - Mystical/gnostic aesthetic
4. **Run quality checks** - `deno task check-all` before commits
5. **Test deployment** - Verify on Deno Deploy preview
6. **Document changes** - Update relevant docs in `.claude/`
```
