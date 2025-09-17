import { DOMParser } from 'npm:linkedom@^0.18.4'

export interface MockAstroGlobal {
  url: {
    pathname: string
  }
}

export function createMockAstro(pathname = '/'): MockAstroGlobal {
  return {
    url: {
      pathname,
    },
  }
}

export function parseHTML(html: string) {
  const dom = new DOMParser().parseFromString(html, 'text/html')
  return dom
}

export function getNavigationElement(html: string) {
  const dom = parseHTML(html)
  return dom.querySelector('nav[data-nav="main"]')!
}
