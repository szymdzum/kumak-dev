import { assertEquals, assertStringIncludes } from '@std/assert'
import { siteConfig } from '../src/site-config.ts'
import { isPathActive } from '../src/utils/path.ts'
import { renderNavigation } from './component-renderer.ts'
import { getNavigationElement } from './test-utils.ts'

Deno.test('Navigation component - semantic HTML structure', () => {
  const html = renderNavigation({ currentPath: '/' })
  const nav = getNavigationElement(html)

  assertEquals(nav.getAttribute('role'), 'navigation')
  assertEquals(nav.getAttribute('aria-label'), 'Main navigation')
  assertEquals(nav.getAttribute('data-nav'), 'main')

  const ul = nav.querySelector('ul')
  assertEquals(ul?.getAttribute('role'), 'list')

  const links = nav.querySelectorAll('a[data-nav-link]')
  assertEquals(links.length, 3)
})

Deno.test('Navigation component - ARIA current page attribute', () => {
  const html = renderNavigation({ currentPath: '/blog' })
  const nav = getNavigationElement(html)
  const activeLink = nav.querySelector('a[aria-current="page"]')

  assertEquals(activeLink?.getAttribute('aria-current'), 'page')
  assertEquals(activeLink?.getAttribute('href'), '/blog')
  assertEquals(activeLink?.textContent?.trim(), 'Blog')
})

Deno.test('Navigation component - path active detection utility', () => {
  assertEquals(isPathActive('/', '/'), true)
  assertEquals(isPathActive('/blog', '/blog'), true)
  assertEquals(isPathActive('/blog/post-1', '/blog'), true)
  assertEquals(isPathActive('/about', '/'), false)
  assertEquals(isPathActive('/', '/blog'), false)
  assertEquals(isPathActive('/blog/', '/blog'), true)
  assertEquals(isPathActive('/blog', '/blog/'), true)
})

Deno.test('Navigation component - site config integration', () => {
  assertEquals(Array.isArray(siteConfig.navItems), true)
  assertEquals(siteConfig.navItems.length > 0, true)

  siteConfig.navItems.forEach((item) => {
    assertEquals(typeof item.title, 'string')
    assertEquals(typeof item.href, 'string')
    assertEquals(item.title.length > 0, true)
    assertEquals(item.href.startsWith('/'), true)
  })
})

Deno.test('Navigation component - accessibility requirements', () => {
  const html = renderNavigation({ currentPath: '/blog' })

  assertStringIncludes(html, 'aria-label="Main navigation"')
  assertStringIncludes(html, 'role="navigation"')
  assertStringIncludes(html, 'role="list"')
  assertStringIncludes(html, 'aria-current="page"')
  assertStringIncludes(html, 'data-nav="main"')
  assertStringIncludes(html, 'data-nav-link')
})

Deno.test('Navigation component - keyboard navigation support', () => {
  const html = renderNavigation({ currentPath: '/' })
  const nav = getNavigationElement(html)
  const links = nav.querySelectorAll('a[data-nav-link]')

  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    assertEquals(link.getAttribute('href')?.startsWith('/'), true)
    assertEquals(link.hasAttribute('data-nav-link'), true)
  }
})

Deno.test('Navigation component - renders actual site config items', () => {
  const html = renderNavigation({ currentPath: '/' })
  const nav = getNavigationElement(html)
  const links = nav.querySelectorAll('a[data-nav-link]')

  assertEquals(links.length, siteConfig.navItems.length)

  siteConfig.navItems.forEach((configItem, index) => {
    const link = links[index]
    assertEquals(link.getAttribute('href'), configItem.href)
    assertEquals(link.textContent?.trim(), configItem.title)
  })
})

Deno.test('Navigation component - active state matches current path', () => {
  siteConfig.navItems.forEach((item) => {
    const html = renderNavigation({ currentPath: item.href })
    const nav = getNavigationElement(html)
    const activeLink = nav.querySelector('a[aria-current="page"]')
    const expectedLink = nav.querySelector(`a[href="${item.href}"]`)

    assertEquals(activeLink, expectedLink, `Active link should be ${item.href} when currentPath is ${item.href}`)
    assertEquals(activeLink?.getAttribute('aria-current'), 'page')
  })
})
