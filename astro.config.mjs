// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://kumak.dev",
  output: "static",

  integrations: [
    mdx({
      remarkPlugins: [],
      rehypePlugins: [],
    }),
    sitemap(),
  ],

  markdown: {
    shikiConfig: {
      theme: "github-dark-dimmed",
    },
  },

  // Performance optimizations
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },

  build: {
    inlineStylesheets: "never", // Manual inline via Head.astro ?raw import
  },

  vite: {
    build: {
      cssMinify: true,
    },
  },
});
