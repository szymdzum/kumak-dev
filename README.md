# Kumak's Blog

> Personal blog built with Astro, powered by Deno, and deployed to Deno Deploy.

[![Deploy Status](https://github.com/szymdzum/kumak-dev/workflows/CI/CD/badge.svg)](https://github.com/szymdzum/kumak-dev/actions)

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build) - Fast, content-focused web framework
- **Runtime**: [Deno](https://deno.com) - Secure JavaScript/TypeScript runtime
- **Hosting**: [Deno Deploy](https://deno.com/deploy) - Global edge deployment
- **Styling**: CSS with modern features and design tokens
- **Content**: Markdown with frontmatter and content collections

## 📁 Project Structure

```text
├── .github/           # GitHub workflows and templates
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components (.astro)
│   ├── content/       # Content collections & schemas
│   ├── layouts/       # Page templates
│   ├── pages/         # File-based routes
│   ├── styles/        # Global CSS
│   └── utils/         # TypeScript utilities
├── tests/             # Test files
├── astro.config.mjs   # Astro configuration
├── deno.json          # Deno configuration & tasks
└── site-config.ts     # Site metadata
```

## 🧞 Development Commands

All commands use Deno tasks defined in `deno.json`:

| Command              | Action                                    |
| :------------------- | :---------------------------------------- |
| `deno task dev`      | Start development server                 |
| `deno task build`    | Build production site                    |
| `deno task preview`  | Preview production build locally         |
| `deno task deploy`   | Deploy to Deno Deploy                    |
| `deno task test`     | Run all tests                            |
| `deno task lint`     | Lint code with Deno                      |
| `deno task format`   | Format code with Deno                    |
| `deno task check-all`| Run all checks (lint + format + astro)   |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/szymdzum/kumak-dev.git
cd kumak-dev

# Start development server
deno task dev

# Build for production
deno task build

# Deploy to production
deno task deploy
```

## 📜 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow and guidelines.

## 🚀 Deployment

The site is automatically deployed to [Deno Deploy](https://deno.com/deploy) on every push to `main`. The deployment is handled by GitHub Actions.

**Live Site**: [kumak.dev](https://kumak.dev) (coming soon)

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Credits**: This blog is built on the excellent [Astro Blog Template](https://github.com/withastro/astro/tree/main/examples/blog) and inspired by [Bear Blog](https://github.com/HermanMartinus/bearblog/).
