// @ts-check
import { defineConfig } from "astro/config";
import deno from "@deno/astro-adapter";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { externalLinks } from "./src/utils/links.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://kumak.dev",
  output: "server",
  adapter: deno(),

  integrations: [
    mdx({
      remarkPlugins: [],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "prepend",
            properties: {
              className: ["heading-anchor"],
              ariaLabel: "Link to this section",
            },
            content: {
              type: "element",
              tagName: "span",
              properties: { className: ["anchor-icon"], ariaHidden: "true" },
              children: [{ type: "text", value: "#" }],
            },
          },
        ],
        [externalLinks, { domain: "kumak.dev" }],
      ],
    }),
    sitemap(),
    icon(),
  ],

  markdown: {
    shikiConfig: {
      theme: "one-dark-pro",
    },
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "prepend",
          properties: {
            className: ["heading-anchor"],
            ariaLabel: "Link to this section",
          },
          content: {
            type: "element",
            tagName: "span",
            properties: { className: ["anchor-icon"], ariaHidden: "true" },
            children: [{ type: "text", value: "#" }],
          },
        },
      ],
    ],
  },

  // Performance optimizations
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },

  build: {
    inlineStylesheets: "auto", // Inline small stylesheets to reduce render-blocking
  },

  vite: {
    build: {
      cssMinify: true,
    },
  },
});
