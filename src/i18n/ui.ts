// Site languages and UI copy. No Astro imports: astro.config.mjs reads LOCALES too.
import { siteConfig } from "../site-config";

export const LOCALES = ["en", "pl"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Per-language Intl locale (dates; Open Graph uses it with "_") and the language's own name. */
export const LOCALE_META = {
  en: { intl: "en-GB", name: "English" },
  pl: { intl: "pl-PL", name: "Polski" },
} as const satisfies Record<Locale, { intl: string; name: string }>;

/** Narrows Astro.currentLocale (a string, undefined outside i18n routes) to a site locale. */
export function toLocale(value: string | undefined): Locale {
  return LOCALES.find((locale) => locale === value) ?? DEFAULT_LOCALE;
}

/** A page's path in each language it exists in, e.g. `{ en: "/", pl: "/pl/" }`. */
export type Translations = Partial<Record<Locale, string>>;

/** The same path in every language, for pages that always exist in all of them. */
export function pathInAllLocales(path: string): Translations {
  return Object.fromEntries(LOCALES.map((locale) => [locale, localePath(locale, path)]));
}

/**
 * Language versions of a page as [locale, path] pairs, the current page included
 * (its own path wins over a `translations` entry for the same locale).
 */
export function pageVersions(
  translations: Translations,
  locale: Locale,
  path: string,
): [Locale, string][] {
  return Object.entries({ ...translations, [locale]: path }) as [Locale, string][];
}

/**
 * Path of a page in a language: English has no prefix, other languages get /<locale>.
 * Not astro:i18n's getRelativeLocaleUrl: that adds a trailing slash ("/about/"), changing
 * existing links, and this module must stay importable from astro.config.mjs.
 */
export function localePath(locale: Locale, path: string): string {
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}

const en = {
  tagline: siteConfig.description as string,
  skipToContent: "Skip to content",
  home: (site: string) => `${site} home`,
  socialLinks: "Social links",
  profileOn: (handle: string, network: string) => `${handle} on ${network}`,
  subscribeVia: (feed: string) => `Subscribe via ${feed}`,
  llmsFull: "LLMs.txt full content",
  languageSwitch: "Language",
  builtWith: "Built with Astro.",
  recentPosts: "Recent Posts",
  otherLanguagePosts: "In Polish",
  read: "Read",
  published: "Published",
  readingTime: "Reading time",
  minRead: (minutes: number) => `${minutes} min read`,
  category: "Category",
  categories: {
    tutorial: "tutorial",
    opinion: "opinion",
    project: "project",
    philosophy: "philosophy",
  },
  tableOfContents: "Table of contents",
  onThisPage: "On this page",
  furtherReading: "Further Reading",
  articleFooterLead: "Thoughts? Disagreements? Hit me up on",
  or: "or",
  llmsVersion: "View LLM-friendly version",
  copy: "Copy",
  copied: "Copied",
  copyFailed: "Failed",
  copyAsMarkdown: "Copy as Markdown",
  share: "Share",
  shareArticle: "Share this article",
  linkCopied: "Link copied",
  copyCode: "Copy code to clipboard",
  codeCopied: "Copied to clipboard",
  commentsFallback:
    "Comments are powered by GitHub Discussions and load when you scroll here. You can also read or join the discussion on",
  notFoundTitle: "Page Not Found",
  notFoundDescription: "The page you're looking for doesn't exist.",
  notFoundText: "The page you're looking for doesn't exist or has been moved.",
  backHome: "Go back home",
};

type Messages = typeof en;
export type Category = keyof Messages["categories"];

const pl: Messages = {
  tagline: "Front-end, narzędzia dla LLM i to, co naprawdę działa.",
  skipToContent: "Przejdź do treści",
  home: (site) => `${site}, strona główna`,
  socialLinks: "Linki do profili",
  profileOn: (handle, network) => `${handle} na ${network}`,
  subscribeVia: (feed) => `Subskrybuj przez ${feed}`,
  llmsFull: "Pełna treść w LLMs.txt",
  languageSwitch: "Język",
  builtWith: "Zbudowane w Astro.",
  recentPosts: "Najnowsze wpisy",
  otherLanguagePosts: "Po angielsku",
  read: "Czytaj",
  published: "Opublikowano",
  readingTime: "Czas czytania",
  minRead: (minutes) => `${minutes} min czytania`,
  category: "Kategoria",
  categories: {
    tutorial: "poradnik",
    opinion: "opinia",
    project: "projekt",
    philosophy: "filozofia",
  },
  tableOfContents: "Spis treści",
  onThisPage: "Na tej stronie",
  furtherReading: "Do poczytania",
  articleFooterLead: "Przemyślenia? Inne zdanie? Napisz do mnie na",
  or: "albo",
  llmsVersion: "Wersja dla LLM",
  copy: "Kopiuj",
  copied: "Skopiowano",
  copyFailed: "Błąd",
  copyAsMarkdown: "Kopiuj jako Markdown",
  share: "Udostępnij",
  shareArticle: "Udostępnij artykuł",
  linkCopied: "Skopiowano link",
  copyCode: "Kopiuj kod do schowka",
  codeCopied: "Skopiowano do schowka",
  commentsFallback:
    "Komentarze działają na GitHub Discussions i ładują się, gdy tu przewiniesz. Dyskusję możesz też przeczytać albo do niej dołączyć na",
  notFoundTitle: "Nie znaleziono strony",
  notFoundDescription: "Strona, której szukasz, nie istnieje.",
  notFoundText: "Strona, której szukasz, nie istnieje albo została przeniesiona.",
  backHome: "Wróć na stronę główną",
};

const MESSAGES: Record<Locale, Messages> = { en, pl };

/** The page's language and UI copy: `const { locale, t } = i18n(Astro.currentLocale)`. */
export function i18n(current: string | undefined): { locale: Locale; t: Messages } {
  const locale = toLocale(current);
  return { locale, t: MESSAGES[locale] };
}
