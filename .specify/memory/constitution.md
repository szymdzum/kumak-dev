<!--
Sync Impact Report:
Version Change: N/A → 1.0.0
Modified Principles: Initial constitution creation
Added Sections: All sections (initial creation)
Removed Sections: None
Templates Status:
  ✅ plan-template.md - Constitution Check section aligns with new principles
  ✅ spec-template.md - Requirements structure aligns with quality gates
  ✅ tasks-template.md - Task phases support testing and quality requirements
Follow-up TODOs: None - all placeholders resolved
-->

# Kumak's Blog Constitution

## Core Principles

### I. Static-First Architecture
Every feature MUST be designed for static site generation. No client-side JavaScript REQUIRED for core functionality. Progressive enhancement over baseline HTML/CSS. Build output MUST be deployable to any static host without runtime dependencies.

**Rationale**: Static architecture ensures maximum performance (100/100 Lighthouse), predictable deployment, and minimal operational complexity. Edge deployment requires zero runtime state.

### II. Type Safety & Quality Gates (NON-NEGOTIABLE)
TypeScript strict mode MANDATORY. No `any` types permitted. All code MUST pass pre-commit hooks: format check, lint (79 rules), Astro check, TypeScript validation, and tests (must maintain 100% pass rate). Build MUST succeed before commit.

**Rationale**: Quality gates prevent regressions and ensure maintainability. Automated enforcement reduces manual review burden and catches issues before deployment.

### III. Content-First Design
Content collections with Zod schemas MUST define all content types. All blog posts stored as Markdown/MDX in `src/content/blog/`. Use `PostsManager` utility for all content queries—no direct collection access. Content MUST be independently testable and portable.

**Rationale**: Content collections provide type-safe content, enabling compile-time validation. Centralized query utility ensures consistent sorting/filtering across the site.

### IV. Semantic HTML & Accessibility
Semantic HTML5 elements REQUIRED (no `<div>` soup). WCAG AA compliance MANDATORY. All interactive elements MUST be keyboard accessible. Images MUST have meaningful alt text or empty alt for decorative images.

**Rationale**: Accessibility is a baseline requirement. Semantic HTML improves SEO, screen reader experience, and maintainability.

### V. Design Token System
All design values (colors, spacing, typography) MUST use CSS custom properties defined in `src/styles/variables.css`. No hardcoded design values in components. Container-aware responsive units for fluid layouts. Modular CSS architecture—one CSS file per component.

**Rationale**: Design tokens enable consistent theming, easy maintenance, and runtime customization. Container queries provide better responsive behavior than media queries alone.

### VI. Zero Legacy Dependencies
JSR packages only—no npm dependencies. Deno 2.x runtime exclusively. No polyfills or compatibility shims. Target modern browsers (last 2 versions, >0.5% market share).

**Rationale**: JSR-first aligns with Deno ecosystem. Modern browser targeting reduces bundle size and complexity. Deno Deploy Early Access requires pure ESM modules.

### VII. Performance Budgets
Lighthouse score MUST maintain 100/100 performance. Global edge deployment MUST achieve <50ms TTFB (6 regions). Zero client JavaScript for static pages. Build time MUST remain <2 minutes for full site. Error rate MUST be 0.00% (as measured by Deno Deploy metrics).

**Rationale**: Performance is a feature. Edge deployment value is lost if pages are slow. Static pages have no excuse for client-side rendering overhead.

## Deployment Standards

### Continuous Deployment Pipeline
All commits to `main` MUST auto-deploy via GitHub Actions to Deno Deploy Early Access (`devblog` project). Deployment MUST complete within 2 minutes total. Pipeline MUST block on quality gate failures (lint, format, tests, build). SSL via Let's Encrypt with auto-renewal. Domains: kumak.dev, www.kumak.dev (Cloudflare proxy).

### Infrastructure as Code
Deployment configuration in `deno.json` (tasks) and GitHub Actions workflows. No manual Deno Deploy console changes—all infrastructure changes MUST be committed to repository. Deployment regions: 6 global regions (managed by Deno Deploy EA).

## Development Workflow

### Local Development
Use `deno task dev` for local development server (localhost:4321). Use `deno task build` to verify production build. Use `deno task check-all` before committing (runs Astro check + lint + format). Use `deno task test` to run test suite. Use `deno task fix` for auto-fixing lint/format issues.

### Code Review Requirements
All PRs MUST pass automated quality gates. PRs MUST include context-efficient descriptions (per CLAUDE.md Context Efficiency Rule). Breaking changes MUST update affected documentation (`README.md`, `CLAUDE.md`, `CURRENT_CONFIG.md`). Configuration changes MUST be tested in preview deployment.

### Testing Strategy
Tests OPTIONAL unless feature requires behavioral verification. When tests exist: MUST maintain 100% pass rate. Unit tests for utilities (e.g., `postSorter.ts`). Integration tests for content collections. No E2E tests for static pages (visual regression testing via Lighthouse CI instead).

## Governance

### Amendment Process
Constitution changes REQUIRE version bump (semantic versioning). MAJOR: Principle removal or redefinition. MINOR: New principle or section. PATCH: Clarifications, typos. Amendments MUST update this file and propagate changes to dependent templates (`.specify/templates/*.md`).

### Compliance Review
Pre-commit hooks enforce Type Safety & Quality Gates (Principle II). Lighthouse CI enforces Performance Budgets (Principle VII). Manual review verifies Semantic HTML & Accessibility (Principle IV) on PR submissions. Constitution violations MUST be justified in `plan.md` Complexity Tracking table.

### Runtime Guidance
Refer to `CLAUDE.md` for AI assistant development instructions. Refer to `CURRENT_CONFIG.md` for infrastructure details. Refer to `.claude/code-guide.md` for TypeScript/Astro code patterns. All guidance files MUST align with constitution principles.

**Version**: 1.0.0 | **Ratified**: 2025-10-13 | **Last Amended**: 2025-10-13
