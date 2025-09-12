type PathnameResult = {
  pathname: string
  subpath: string[] | null
}

/**
 * Extracts the pathname and subpath from a URL
 * @param url - The URL to extract pathname from
 */
export const getPathname = (url: URL): PathnameResult => {
  // Use globalThis to safely access import.meta.env in both Astro and Deno environments
  // In Deno tests, this will be undefined and fallback to empty string
  const globalWithImport = globalThis as { import?: { meta?: { env?: { BASE_URL?: string } } } }
  const baseUrl = globalWithImport.import?.meta?.env?.BASE_URL || ''
  const pathname = url.pathname.replace(baseUrl, '')
  const subpath = pathname.match(/[^\/]+/g)

  return { pathname, subpath }
}

/**
 * Route builder for type-safe URL generation
 */
export class RouteBuilder {
  private base: string
  private segments: string[] = []

  constructor(base = '') {
    this.base = base ? (base.startsWith('/') ? base : `/${base}`) : ''
  }

  /**
   * Add a segment to the route
   * @param segment - URL segment to add
   */
  segment(segment: string): RouteBuilder {
    if (!segment) throw new Error('Segment cannot be empty')

    // Encode the segment to handle special characters safely
    const encoded = encodeURIComponent(segment.replace(/\//g, ''))
    this.segments.push(encoded)
    return this
  }

  /**
   * Build the final URL path
   * @param trailingSlash - Whether to add trailing slash (default: true)
   */
  build(trailingSlash = true): string {
    const parts = [this.base, ...this.segments].filter((part) => part.length > 0)
    const path = parts.join('/')
    const finalPath = path.startsWith('/') ? path : `/${path}`
    return trailingSlash ? `${finalPath}/` : finalPath
  }

  /**
   * Build as URL object for additional validation
   * @param baseUrl - Base URL for absolute URLs
   */
  toURL(baseUrl?: string): URL {
    const path = this.build()
    return baseUrl ? new URL(path, baseUrl) : new URL(path, 'http://localhost')
  }
}

/**
 * Blog-specific URL builders
 */
export const BlogRoutes = {
  /**
   * Generate blog post URL
   * @param slug - Post slug
   */
  post(slug: string): string {
    return new RouteBuilder('blog').segment(slug).build()
  },

  /**
   * Generate blog category URL
   * @param category - Category name
   */
  category(category: string): string {
    return new RouteBuilder('blog').segment('category').segment(category).build()
  },

  /**
   * Generate blog tag URL
   * @param tag - Tag name
   */
  tag(tag: string): string {
    return new RouteBuilder('blog').segment('tag').segment(tag).build()
  },

  /**
   * Blog index URL
   */
  index(): string {
    return new RouteBuilder('blog').build()
  },
} as const

/**
 * Site-wide URL builders
 */
export const SiteRoutes = {
  /**
   * Home page
   */
  home(): string {
    return '/'
  },

  /**
   * Projects page
   */
  projects(): string {
    return new RouteBuilder('projects').build()
  },

  /**
   * About page
   */
  about(): string {
    return new RouteBuilder('about').build()
  },

  /**
   * RSS feed
   */
  rss(): string {
    return '/rss.xml'
  },
} as const

/**
 * Utility functions for URL manipulation
 */
export const UrlUtils = {
  /**
   * Validate if a URL is safe and well-formed
   * @param urlString - URL to validate
   */
  isValidUrl(urlString: string): boolean {
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  },

  /**
   * Ensure URL has proper protocol for external links
   * @param url - URL to normalize
   */
  normalizeExternalUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  },

  /**
   * Join URL segments safely
   * @param segments - URL segments to join
   */
  joinSegments(...segments: string[]): string {
    return segments
      .map((segment) => segment.replace(/^\/+|\/+$/g, ''))
      .filter((segment) => segment.length > 0)
      .join('/')
  },

  /**
   * Create anchor link from heading text
   * @param text - Heading text
   */
  createAnchor(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  },
} as const
