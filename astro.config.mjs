// @ts-check
import { defineConfig } from "astro/config";
import deno from "@deno/astro-adapter";
import mdx from "@astrojs/mdx";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { externalLinks } from "./src/utils/links.ts";

// @deno/astro-adapter 0.6.0 + Astro 7: app.removeBase() keeps the leading slash, producing
// "client//about/" so the prerendered index.html fallback never matches and every static page 404s.
// Remove once fixed upstream (denoland/deno-astro-adapter).
const fixDenoAdapterStaticPaths = () => ({
  name: "fix-deno-adapter-static-paths",
  transform(code, id) {
    if (!id.includes("@deno/astro-adapter/src/server.ts")) return;
    const target = '"./" + app.removeBase(url.pathname)';
    if (!code.includes(target)) {
      throw new Error(
        "fix-deno-adapter-static-paths: adapter changed, re-check if patch is needed",
      );
    }
    return code.replace(target, '"./" + app.removeBase(url.pathname).replace(/^\\/+/, "")');
  },
});

// https://astro.build/config
export default defineConfig({
  site: "https://kumak.dev",
  output: "server",
  adapter: deno(),

  integrations: [mdx(), sitemap(), icon()],

  markdown: {
    shikiConfig: {
      theme: "one-dark-pro",
    },
    processor: unified({
      rehypePlugins: [
        rehypeHeadingIds,
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
    plugins: [fixDenoAdapterStaticPaths()],
    build: {
      cssMinify: true,
    },
  },
});
