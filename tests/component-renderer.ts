import { siteConfig } from '../src/site-config.ts'
import { isPathActive } from '../src/utils/path.ts'

export interface RenderOptions {
  currentPath?: string
}

export function renderNavigation(options: RenderOptions = {}): string {
  const { currentPath = '/' } = options

  const navItems = siteConfig.navItems.map(({ href, title }) => {
    const ariaCurrent = isPathActive(currentPath, href) ? ' aria-current="page"' : ''
    return `        <li>
          <a
            href="${href}"${ariaCurrent}
            data-nav-link
          >
            ${title}
          </a>
        </li>`
  }).join('\n')

  return `<nav role="navigation" aria-label="Main navigation" data-nav="main">
    <ul role="list">
${navItems}
    </ul>
</nav>`
}
