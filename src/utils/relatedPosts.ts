import type { CollectionEntry } from 'astro:content'

interface ScoredPost {
  post: CollectionEntry<'blog'>
  score: number
}

interface SimilarityWeights {
  tagOverlap: number
  categoryMatch: number
  readingTimeSimilarity: number
  recency: number
}

const DEFAULT_WEIGHTS: SimilarityWeights = {
  tagOverlap: 0.4, // 40% weight for tag similarity
  categoryMatch: 0.3, // 30% weight for same category
  readingTimeSimilarity: 0.1, // 10% weight for similar length
  recency: 0.2, // 20% weight for recency
}

/**
 * Calculate tag overlap score (Jaccard similarity)
 */
function calculateTagOverlap(tags1: string[], tags2: string[]): number {
  if (tags1.length === 0 || tags2.length === 0) return 0

  const set1 = new Set(tags1)
  const set2 = new Set(tags2)

  const intersection = new Set([...set1].filter((tag) => set2.has(tag)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

/**
 * Calculate reading time similarity (closer reading times = higher score)
 */
function calculateReadingTimeSimilarity(time1: number, time2: number): number {
  const diff = Math.abs(time1 - time2)
  // Use exponential decay: similar times get high scores
  return Math.exp(-diff / 5) // 5 minutes as scale factor
}

/**
 * Calculate recency score (newer posts get higher scores)
 */
function calculateRecencyScore(date: Date, maxAge = 365): number {
  const now = new Date()
  const ageInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

  if (ageInDays > maxAge) return 0

  // Linear decay over maxAge days
  return 1 - (ageInDays / maxAge)
}

/**
 * Calculate weighted similarity score between two posts
 */
function calculateSimilarity(
  current: CollectionEntry<'blog'>,
  candidate: CollectionEntry<'blog'>,
  weights: SimilarityWeights = DEFAULT_WEIGHTS,
): number {
  let score = 0

  // Tag overlap
  const tagScore = calculateTagOverlap(
    current.data.tags || [],
    candidate.data.tags || [],
  )
  score += tagScore * weights.tagOverlap

  // Category match
  if (current.data.category === candidate.data.category) {
    score += weights.categoryMatch
  }

  // Reading time similarity (if available)
  if (current.data.minutesToRead && candidate.data.minutesToRead) {
    const timeScore = calculateReadingTimeSimilarity(
      current.data.minutesToRead,
      candidate.data.minutesToRead,
    )
    score += timeScore * weights.readingTimeSimilarity
  }

  // Recency
  const recencyScore = calculateRecencyScore(candidate.data.pubDate)
  score += recencyScore * weights.recency

  return score
}

/**
 * Get related posts for a given post
 */
export function getRelatedPosts(
  current: CollectionEntry<'blog'>,
  allPosts: CollectionEntry<'blog'>[],
  limit = 5,
  weights?: Partial<SimilarityWeights>,
): CollectionEntry<'blog'>[] {
  const finalWeights = { ...DEFAULT_WEIGHTS, ...weights }

  // First check if there are manually specified related posts
  if (current.data.relatedPosts && current.data.relatedPosts.length > 0) {
    const manualRelated = current.data.relatedPosts
      .map((slug: string) => allPosts.find((p) => p.id === slug || p.slug === slug))
      .filter((p: CollectionEntry<'blog'> | undefined): p is CollectionEntry<'blog'> => p !== undefined)
      .slice(0, limit)

    if (manualRelated.length >= limit) {
      return manualRelated
    }

    // If we have some manual but not enough, calculate the rest
    const remaining = limit - manualRelated.length
    const calculated = getCalculatedRelatedPosts(
      current,
      allPosts.filter((p) => !manualRelated.includes(p)),
      remaining,
      finalWeights,
    )

    return [...manualRelated, ...calculated]
  }

  // No manual related posts, calculate all
  return getCalculatedRelatedPosts(current, allPosts, limit, finalWeights)
}

/**
 * Calculate related posts using similarity algorithm
 */
function getCalculatedRelatedPosts(
  current: CollectionEntry<'blog'>,
  candidates: CollectionEntry<'blog'>[],
  limit: number,
  weights: SimilarityWeights,
): CollectionEntry<'blog'>[] {
  // Filter out the current post and drafts
  const eligiblePosts = candidates.filter(
    (p) => p.id !== current.id && p.slug !== current.slug && !p.data.draft,
  )

  // Calculate scores
  const scored: ScoredPost[] = eligiblePosts.map((post) => ({
    post,
    score: calculateSimilarity(current, post, weights),
  }))

  // Sort by score and return top matches
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter((item) => item.score > 0.1) // Minimum threshold
    .map((item) => item.post)
}

/**
 * Get posts by tag
 */
export function getPostsByTag(
  posts: CollectionEntry<'blog'>[],
  tag: string,
): CollectionEntry<'blog'>[] {
  return posts.filter((post) => post.data.tags?.includes(tag) && !post.data.draft)
}

/**
 * Get posts by category
 */
export function getPostsByCategory(
  posts: CollectionEntry<'blog'>[],
  category: string,
): CollectionEntry<'blog'>[] {
  return posts.filter((post) => post.data.category === category && !post.data.draft)
}

/**
 * Get all unique tags from posts
 */
export function getAllTags(posts: CollectionEntry<'blog'>[]): string[] {
  const tags = new Set<string>()

  posts.forEach((post) => {
    if (post.data.tags && !post.data.draft) {
      post.data.tags.forEach((tag: string) => tags.add(tag))
    }
  })

  return Array.from(tags).sort()
}

/**
 * Get tag counts for tag cloud
 */
export function getTagCounts(posts: CollectionEntry<'blog'>[]): Map<string, number> {
  const counts = new Map<string, number>()

  posts.forEach((post) => {
    if (post.data.tags && !post.data.draft) {
      post.data.tags.forEach((tag: string) => {
        counts.set(tag, (counts.get(tag) || 0) + 1)
      })
    }
  })

  return counts
}
