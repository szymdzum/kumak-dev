// @ts-check
import { readdirSync, readFileSync } from "node:fs";
import { defineConfig, fontProviders } from "astro/config";
import deno from "@deno/astro-adapter";
import mdx from "@astrojs/mdx";
import { parseFrontmatter, rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { externalLinks } from "./src/utils/links.ts";
import { scrollableTables } from "./src/utils/tables.ts";

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
  // serveFile sets no Cache-Control. /_astro/ (incl. Fonts API /_astro/fonts/) is content-hashed.
  [
    "return fileResp;",
    'if (/^\\/_astro\\//.test(url.pathname)) fileResp.headers.set("Cache-Control", "public, max-age=31536000, immutable"); return fileResp;',
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

// Sitemap <lastmod> for posts. astro:content isn't available here, so parse each post's
// frontmatter directly (same YAML parser Astro uses). Slug = file name.
const BLOG_DIR = new URL("./src/content/blog/", import.meta.url);

const postLastmod = new Map(
  readdirSync(BLOG_DIR)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => [
      file.replace(/\.mdx?$/, ""),
      parseFrontmatter(readFileSync(new URL(file, BLOG_DIR), "utf8")).frontmatter,
    ])
    .filter(([, fm]) => !fm.draft)
    .map(([slug, fm]) => [slug, new Date(fm.updatedDate ?? fm.pubDate)])
    .filter(([, date]) => !Number.isNaN(date.getTime()))
    .map(([slug, date]) => [slug, date.toISOString()]),
);

const withPostLastmod = (item) => {
  const lastmod = postLastmod.get(new URL(item.url).pathname.replace(/^\/|\/$/g, ""));
  return lastmod ? { ...item, lastmod } : item;
};

// Inter latin subset (matches Google Fonts' "latin" unicode-range).
const INTER_UNICODE_RANGE = [
  "U+0000-00FF",
  "U+0131",
  "U+0152-0153",
  "U+02BB-02BC",
  "U+02C6",
  "U+02DA",
  "U+02DC",
  "U+0304",
  "U+0308",
  "U+0329",
  "U+2000-206F",
  "U+2074",
  "U+20AC",
  "U+2122",
  "U+2191",
  "U+2193",
  "U+2212",
  "U+2215",
  "U+FEFF",
  "U+FFFD",
];

// https://astro.build/config
export default defineConfig({
  site: "https://kumak.dev",
  output: "server",
  adapter: deno(),

  fonts: [
    {
      provider: fontProviders.local(),
      name: "Inter",
      cssVariable: "--font-inter",
      fallbacks: [
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Oxygen",
        "Ubuntu",
        "Cantarell",
        "sans-serif",
      ],
      options: {
        variants: [400, 700].map((weight) => ({
          src: [`./src/assets/fonts/inter-latin-${weight}.woff2`],
          weight,
          style: "normal",
          display: "swap",
          unicodeRange: INTER_UNICODE_RANGE,
        })),
      },
    },
  ],

  integrations: [mdx(), sitemap({ serialize: withPostLastmod }), icon()],

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
              ariaHidden: "true",
              tabIndex: -1,
            },
            content: {
              type: "element",
              tagName: "span",
              properties: { className: ["anchor-icon"] },
              children: [],
            },
          },
        ],
        [externalLinks, { domain: "kumak.dev" }],
        scrollableTables,
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
