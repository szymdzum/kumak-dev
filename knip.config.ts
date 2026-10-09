import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/pages/**/*.{astro,ts,js,mdx}"],
  project: ["src/**/*.{ts,tsx,astro,mdx,js,mjs}"],
  ignoreExportsUsedInFile: {
    interface: true,
    type: true,
  },
  ignoreDependencies: [
    "@iconify-json/lucide", // Icon set loaded by astro-icon
    "hast", // Type-only import (from @types/hast)
  ],
  astro: {
    entry: ["src/pages/**/*.{astro,ts,mdx}", "src/layouts/**/*.astro"],
  },
};

export default config;
