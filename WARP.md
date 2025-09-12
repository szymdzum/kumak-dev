# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Commands

All commands assume you’re in the project root.

### Development

- Install dependencies and start dev server:
  ```bash
  deno task dev
  ```
- Run all tests:
  ```bash
  deno test
  ```
- Run a single test by name or file:
  ```bash
  deno test --filter="basic test"
  deno test tests/basic_test.ts
  ```
- Lint code:
  ```bash
  deno task lint
  ```
- Format code:
  ```bash
  deno task format
  ```
- Run checks (lint + format):
  ```bash
  deno task check-all
  ```

### Build & Deploy

- Build production site:
  ```bash
  deno task build
  ```
- Preview production build:
  ```bash
  deno task preview
  ```
- Deploy (using Deno Deploy):
  ```bash
  deno task deploy
  ```

## Project Structure Overview

- deno.json         — Deno task definitions & configuration
- astro.config.mjs  — Astro configuration (Deno adapter)
- site-config.ts    — Site metadata & frontmatter config
- env.d.ts          — Global type declarations
- tsconfig.json     — TypeScript settings
- README.md         — Upstream Astro blog starter notes

src/
├── components/     # Reusable UI components (.astro)
├── content/        # Content collections & schemas
├── layouts/        # Page templates
├── pages/          # File-based routes (Astro pages & API endpoints)
├── styles/         # Global CSS (reset, typography, variables)
└── utils/          # TS helper modules (path, URL, sorting)

tests/
└── basic_test.ts   # Sample Deno test suite

.cursor/rules/      # Project-specific coding guidelines (Astro, CSS, workflow)

## Key Development Guidelines

### Astro Patterns
- Zero JavaScript by default; enhance with islands (client:load, idle, visible).
- Define props with TypeScript types & defaults.
- Name components in PascalCase; utilities in kebab-case (.ts).

### CSS Conventions
- Use exception-based styling: global defaults, then exception selectors.
- Leverage CSS custom properties for design tokens & modular scale.
- Favor proportional units (rem, em) over fixed pixels.

### Workflow Principles
- Incremental development: small, validated steps; descriptive, focused commits.
- Error handling: implement boundaries and fallbacks; avoid unhandled exceptions.
- Performance: minimize client JS, optimize images, lazy-load off-screen content, set cache headers.

## Additional Notes

- Runtime: Deno (no Node.js-specific features).
- Use `deno fmt` and `deno lint` as configured in deno.json.
- For content-driven pages, see `src/content/config.ts` and frontmatter schemas.

