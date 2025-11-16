import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  // Entry points for the Astro app
  entry: ['src/pages/**/*.{astro,ts,js,mdx}', 'src/content/config.ts'],

  // Project files to analyze
  project: ['src/**/*.{ts,tsx,astro,mdx,js,mjs}'],

  // Ignore patterns
  ignore: [
    'dist/**', // Build output
    '.astro/**', // Astro cache
    'node_modules/**',
    'coverage/**',
    'tests/**', // Tests are checked separately
  ],

  // Ignore specific exports that are used by Astro framework
  ignoreExportsUsedInFile: {
    interface: true, // Astro uses TypeScript interfaces for props
    type: true, // Type definitions used by Astro
  },

  // Astro-specific configuration
  astro: {
    entry: ['src/pages/**/*.{astro,ts,mdx}', 'src/layouts/**/*.astro'],
  },

  // Don't report these as unused
  ignoreDependencies: [
    '@astrojs/check', // Used in scripts
    '@deno/astro-adapter', // Referenced in config (commented out)
    'astro-icon', // Used in Astro components
  ],

  // TypeScript configuration
  typescript: {
    config: ['tsconfig.json'],
  },
}

export default config
