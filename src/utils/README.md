# Blog Post Management Utilities

This directory contains utilities for managing, filtering, and sorting blog posts in the Astro project.

## PostsManager

The `PostsManager` class provides a fluent API for working with blog posts. It uses a chainable method pattern for filtering, sorting, and limiting posts.

### Basic Usage

```typescript
import { getCollection } from 'astro:content'
import { PostQueries, PostsManager } from '../utils/postSorter'

// Get all blog posts
const allPosts = await getCollection('blog')

// Get the 3 most recent posts
const latestPosts = PostsManager.getLatest(allPosts, 3)

// Get featured posts sorted alphabetically
const featuredPosts = new PostsManager(allPosts)
  .filter(PostQueries.FILTER.FEATURED)
  .sort(PostQueries.SORT.ALPHABETICAL)
  .get()

// Get posts with specific tags
const taggedPosts = new PostsManager(allPosts)
  .filterByTags(['typescript', 'javascript'])
  .sort(PostQueries.SORT.NEWEST_FIRST)
  .limit(5)
  .get()
```

### Preset Methods

The class includes several convenient static methods for common queries:

```typescript
// Get latest posts
const latest = PostsManager.getLatest(allPosts)

// Get featured posts
const featured = PostsManager.getFeatured(allPosts)

// Get posts with a specific tag
const jsPosts = PostsManager.getByTag(allPosts, 'javascript')

// Get recently updated posts
const updated = PostsManager.getRecentlyUpdated(allPosts)
```

### Using with Components

In your Astro components, you can use the utility like this:

```astro
---
import { getCollection } from 'astro:content';
import { PostsManager, PostQueries } from '../utils/postSorter';

// Get posts
const allPosts = await getCollection('blog');
const recentPosts = PostsManager.getLatest(allPosts, 3);
---

<section>
  <h2>Recent Posts</h2>
  {recentPosts.map(post => (
    <article>
      <h3>{post.data.title}</h3>
      <p>{post.data.description}</p>
    </article>
  ))}
</section>
```

Or with the `Featured` component which accepts various props:

```astro
<!-- Show 3 latest posts -->
<Featured preset="latest" />

<!-- Show 5 featured posts -->
<Featured preset="featured" limit={5} />

<!-- Show posts with specific tags in alphabetical order -->
<Featured
  sortBy={PostQueries.SORT.ALPHABETICAL}
  tags={["javascript", "typescript"]}
  limit={10}
/>
```

## PostQueries Constants

The `PostQueries` object contains constants for common filtering and sorting operations:

### Sort Options

```typescript
// Sort by publish date (newest first)
PostQueries.SORT.NEWEST_FIRST

// Sort by publish date (oldest first)
PostQueries.SORT.OLDEST_FIRST

// Sort alphabetically by title (A-Z)
PostQueries.SORT.ALPHABETICAL

// Sort alphabetically by title (Z-A)
PostQueries.SORT.REVERSE_ALPHA

// Sort by update date
PostQueries.SORT.RECENTLY_UPDATED
```

### Filter Options

```typescript
// No filtering (all posts)
PostQueries.FILTER.ALL

// Only posts marked as featured
PostQueries.FILTER.FEATURED

// Only posts with hero images
PostQueries.FILTER.HAS_IMAGE

// Only posts published in the current year
PostQueries.FILTER.PUBLISHED_THIS_YEAR
```

### Limit Constants

```typescript
PostQueries.LIMIT.THREE // 3 posts
PostQueries.LIMIT.FIVE // 5 posts
PostQueries.LIMIT.TEN // 10 posts
```

## API Reference

### PostsManager Class

- `constructor(posts: CollectionEntry<'blog'>[])` - Create a new manager instance
- `filter(filterOption: PostFilterOption): this` - Filter posts
- `filterByTags(tags: string[]): this` - Filter by tags
- `sort(sortBy: SortOption): this` - Sort posts
- `limit(count: number): this` - Limit number of posts
- `get(): CollectionEntry<'blog'>[]` - Get the resulting posts array
- `query(options: PostQueryOptions): CollectionEntry<'blog'>[]` - Apply multiple operations

### Static Methods

- `query(posts, options)` - Apply multiple operations in one call
- `getLatest(posts, count)` - Get latest posts
- `getFeatured(posts, count)` - Get featured posts
- `getByTag(posts, tag, count)` - Get posts with a specific tag
- `getRecentlyUpdated(posts, count)` - Get recently updated posts

## Types

- `SortOption` - Valid sorting methods
- `PostFilterOption` - Valid filtering methods
- `PostQueryOptions` - Options for the query method
