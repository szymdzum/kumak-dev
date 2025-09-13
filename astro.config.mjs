// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  site: 'https://kumak.dev',
  output: 'static',
  // adapter: deno(),
  integrations: [mdx(), sitemap()],
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop',
    },
  },
  build: {
    inlineStylesheets: 'auto', // Inline small CSS files
  },
  compressHTML: true, // Minify HTML output
  vite: {
    build: {
      cssMinify: true, // Minify CSS
      minify: 'terser', // Minify JS if any
      rollupOptions: {
        output: {
          // Ensure consistent file names for better caching
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
        },
      },
    },
  },
})
