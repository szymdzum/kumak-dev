/**
 * Calculate reading time for blog posts
 */

interface ReadingTimeResult {
  minutes: number
  words: number
  time: string
}

/**
 * Count words in regular text (excluding code blocks)
 */
function countTextWords(content: string): number {
  // Remove code blocks
  const withoutCode = content.replace(/```[\s\S]*?```/g, '')
  // Remove inline code
  const withoutInlineCode = withoutCode.replace(/`[^`]*`/g, '')
  // Remove HTML tags
  const withoutHtml = withoutInlineCode.replace(/<[^>]*>/g, '')
  // Count words
  const words = withoutHtml.match(/\b\w+\b/g) || []
  return words.length
}

/**
 * Count words in code blocks (read slower)
 */
function countCodeWords(content: string): number {
  const codeBlocks = content.match(/```[\s\S]*?```/g) || []
  const inlineCode = content.match(/`[^`]*`/g) || []

  const codeContent = [...codeBlocks, ...inlineCode].join(' ')
  const words = codeContent.match(/\b\w+\b/g) || []
  return words.length
}

/**
 * Calculate reading time with different speeds for text and code
 */
export function calculateReadingTime(content: string): ReadingTimeResult {
  const WORDS_PER_MINUTE = 200 // Average reading speed
  const CODE_WORDS_PER_MINUTE = 50 // Slower for code

  const textWords = countTextWords(content)
  const codeWords = countCodeWords(content)
  const totalWords = textWords + codeWords

  const textMinutes = textWords / WORDS_PER_MINUTE
  const codeMinutes = codeWords / CODE_WORDS_PER_MINUTE
  const totalMinutes = Math.ceil(textMinutes + codeMinutes)

  // Format the reading time string
  let timeString: string
  if (totalMinutes === 1) {
    timeString = '1 min read'
  } else if (totalMinutes < 1) {
    timeString = 'Less than 1 min'
  } else {
    timeString = `${totalMinutes} min read`
  }

  return {
    minutes: totalMinutes,
    words: totalWords,
    time: timeString,
  }
}

/**
 * Get reading time emoji based on minutes
 */
export function getReadingTimeEmoji(minutes: number): string {
  if (minutes <= 3) return '☕' // Coffee break
  if (minutes <= 7) return '📖' // Short read
  if (minutes <= 15) return '📚' // Medium read
  return '🎓' // Long read
}

/**
 * Format reading time for display with emoji
 */
export function formatReadingTime(content: string): string {
  const { minutes, time } = calculateReadingTime(content)
  const emoji = getReadingTimeEmoji(minutes)
  return `${emoji} ${time}`
}
