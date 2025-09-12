import type { CollectionEntry } from 'astro:content'

/**
 * Filter posts based on draft status and environment
 */
export function filterDrafts(
  posts: CollectionEntry<'blog'>[],
  options: {
    showDrafts?: boolean
    showOnlyDrafts?: boolean
  } = {},
): CollectionEntry<'blog'>[] {
  const isDev = import.meta.env.DEV
  const showDrafts = options.showDrafts ?? (isDev || import.meta.env.SHOW_DRAFTS)

  if (options.showOnlyDrafts) {
    return posts.filter((post) => post.data.draft === true)
  }

  if (showDrafts) {
    return posts
  }

  return posts.filter((post) => !post.data.draft)
}

/**
 * Check if we should show draft indicator
 */
export function shouldShowDraftIndicator(): boolean {
  return import.meta.env.DEV || import.meta.env.SHOW_DRAFTS
}

/**
 * Get draft badge CSS classes
 */
export function getDraftBadgeClasses(isDraft: boolean): string {
  if (!isDraft) return ''

  return 'draft-badge'
}

/**
 * Sort posts with drafts at the end (in dev mode)
 */
export function sortWithDrafts(
  posts: CollectionEntry<'blog'>[],
  sortByDate = true,
): CollectionEntry<'blog'>[] {
  const sorted = [...posts]

  if (sortByDate) {
    sorted.sort((a, b) => {
      // Sort by date first
      const dateA = new Date(a.data.pubDate).getTime()
      const dateB = new Date(b.data.pubDate).getTime()
      return dateB - dateA
    })
  }

  // In dev mode, move drafts to the top for easier access
  if (import.meta.env.DEV) {
    sorted.sort((a, b) => {
      if (a.data.draft && !b.data.draft) return -1
      if (!a.data.draft && b.data.draft) return 1
      return 0
    })
  }

  return sorted
}
