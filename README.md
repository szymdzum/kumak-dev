# Kumak's Blog

> Personal blog built with Astro, powered by Deno, and deployed to Deno Deploy.

[![Check](https://github.com/szymdzum/kumak-dev/actions/workflows/check.yml/badge.svg)](https://github.com/szymdzum/kumak-dev/actions/workflows/check.yml)

**Live site**: [kumak.dev](https://kumak.dev)

Features:

- ✅ Markdown & MDX posts with table of contents, TL;DR boxes and copyable code blocks
- ✅ SEO: canonical URLs, OpenGraph, Schema.org, sitemap with `lastmod`
- ✅ RSS feed
- ✅ `llms.txt`, `llms-full.txt` and per-post `/llms/<slug>.txt` for LLMs
- ✅ Giscus comments
- ✅ Umami analytics (client-side and server-side for RSS/llms endpoints)

## 🚀 Tech Stack

- **Framework**: [Astro 7](https://astro.build) with `@deno/astro-adapter` (prerendered pages + on-demand endpoints)
- **Runtime/tooling**: [Deno 2](https://deno.com) for tasks, lint, format and the production server; Node (`.nvmrc`) for npm/Astro
- **Hosting**: [Deno Deploy](https://deno.com/deploy) via GitHub integration
- **Styling**: Plain CSS with design tokens and scoped component styles

## 📁 Project Structure

```text
├── .github/workflows/  # CI checks (lint, format, astro check, build)
├── public/             # Static assets
├── src/
│   ├── components/     # UI components (.astro)
│   ├── content/blog/   # MDX posts
│   ├── layouts/        # BaseLayout
│   ├── pages/          # Routes, RSS and llms.txt endpoints
│   ├── styles/         # global.css, prose.css
│   ├── utils/          # TypeScript helpers
│   ├── content.config.ts # Content collection schema
│   └── site-config.ts  # Site metadata
├── astro.config.mjs    # Astro configuration
└── deno.json           # Deno configuration & tasks
```

## 🧞 Development Commands

Run `npm install` once (installs Astro and the Husky pre-commit hook). All other commands are Deno tasks from `deno.json`:

| Command               | Action                                       |
| :-------------------- | :------------------------------------------- |
| `deno task dev`       | Start development server (localhost:4321)    |
| `deno task build`     | Build production site                        |
| `deno task check-all` | Lint + format check + astro check            |
| `deno task fix`       | Auto-fix lint and formatting                 |
| `deno task lint`      | Lint code with Deno                          |
| `deno task format`    | Format code with Deno                        |
| `deno task knip`      | Find unused files and dependencies           |

Run the production build locally with `deno task preview` (port 8085).

## 🚀 Deployment

Every push to `main` is built and deployed by Deno Deploy's GitHub integration. The GitHub Actions `check` workflow runs quality checks and a build on pull requests and `main`.

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Credits**: This blog is built on the excellent [Astro Blog Template](https://github.com/withastro/astro/tree/main/examples/blog) and inspired by [Bear Blog](https://github.com/HermanMartinus/bearblog/).
