// @ts-check
import { defineConfig } from "astro/config";
import deno from "@deno/astro-adapter";
import mdx from "@astrojs/mdx";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { externalLinks } from "./src/utils/links.ts";

// Patches for @deno/astro-adapter 0.6.0 server.ts. Remove once fixed upstream
// (denoland/deno-astro-adapter); the build fails loudly if the adapter code changes.
const DENO_ADAPTER_PATCHES = [
  // Astro 7: app.removeBase() keeps the leading slash, producing "client//about/" so the
  // prerendered index.html fallback never matches and every static page 404s.
  [
    '"./" + app.removeBase(url.pathname)',
    '"./" + app.removeBase(url.pathname).replace(/^\\/+/, "")',
  ],
  // Paths longer than the filesystem limit make stat() throw ENAMETOOLONG -> HTTP 500.
  // Treat any lookup error as "no static file" so the 404 page renders.
  [
    "await serveFile(request, fromFileUrl(localPath))",
    "await serveFile(request, fromFileUrl(localPath)).catch(() => new Response(null, { status: 404 }))",
  ],
];

const patchDenoAdapter = () => ({
  name: "patch-deno-adapter",
  transform(code, id) {
    if (!id.includes("@deno/astro-adapter/src/server.ts")) return;
    return DENO_ADAPTER_PATCHES.reduce((patched, [target, replacement]) => {
      if (!patched.includes(target)) {
        throw new Error(`patch-deno-adapter: "${target}" not found, re-check if patch is needed`);
      }
      return patched.replace(target, replacement);
    }, code);
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
    plugins: [patchDenoAdapter()],
    build: {
      cssMinify: true,
    },
  },
});
