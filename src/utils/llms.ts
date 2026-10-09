import { type BlogPost, isoDate } from "./posts";

interface LlmsItem {
  title: string;
  description: string;
  link: string;
}

interface LlmsFullItem extends LlmsItem {
  pubDate: Date;
  category: string;
  body: string;
}

interface LlmsTxtConfig {
  name: string;
  description: string;
  site: string;
  items: LlmsItem[];
  optional?: LlmsItem[];
}

interface LlmsFullTxtConfig {
  name: string;
  description: string;
  author: string;
  site: string;
  items: LlmsFullItem[];
}

interface LlmsPostConfig {
  post: BlogPost;
  site: string;
  link: string;
}

const FENCE = /^\s*(`{3,}|~{3,})/;
const MDX_IMPORT_EXPORT = /^(import|export)\s/;
const INLINE_CODE = /(`[^`\n]*`)/;
const JSX_TAG = /<\/?[A-Z][\w.]*(\s[^<>]*)?\/?>/g;

/** Drops JSX component tags (keeping children) outside inline code spans. */
function stripJsxTags(line: string): string {
  return line
    .split(INLINE_CODE)
    .map((part, i) => (i % 2 ? part : part.replace(JSX_TAG, "")))
    .join("");
}

/**
 * Turns MDX into plain Markdown: removes top-level import/export lines and
 * component tags (children are kept). Fenced code blocks are left untouched.
 */
function stripMdx(content: string): string {
  let fence: string | null = null;
  const lines: string[] = [];

  for (const line of content.split("\n")) {
    const marker = line.match(FENCE)?.[1];

    if (fence) {
      if (marker && marker[0] === fence[0] && marker.length >= fence.length) fence = null;
      lines.push(line);
    } else if (marker) {
      fence = marker;
      lines.push(line);
    } else if (!MDX_IMPORT_EXPORT.test(line)) {
      lines.push(stripJsxTags(line));
    }
  }

  return lines.join("\n").trim();
}

function doc(...sections: (string | string[])[]): Response {
  const content = sections
    .flat()
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return new Response(content + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function header(name: string, description: string): string[] {
  return [`# ${name}`, "", `> ${description}`];
}

function linkList(title: string, items: LlmsItem[], site: string): string[] {
  return [
    "",
    `## ${title}`,
    ...items.map((item) => `- [${item.title}](${site}${item.link}): ${item.description}`),
  ];
}

function postMeta(site: string, link: string, pubDate: Date, category: string): string[] {
  return [`URL: ${site}${link}`, `Published: ${isoDate(pubDate)}`, `Category: ${category}`];
}

export function llmsTxt(config: LlmsTxtConfig): Response {
  const sections = [
    header(config.name, config.description),
    linkList("Posts", config.items, config.site),
  ];

  if (config.optional?.length) {
    sections.push(linkList("Optional", config.optional, config.site));
  }

  return doc(...sections);
}

export function llmsFullTxt(config: LlmsFullTxtConfig): Response {
  const head = [
    ...header(config.name, config.description),
    "",
    `Author: ${config.author}`,
    `Site: ${config.site}`,
    "",
    "---",
  ];

  const posts = config.items.flatMap((item) => [
    "",
    `## ${item.title}`,
    "",
    ...postMeta(config.site, item.link, item.pubDate, item.category),
    "",
    `> ${item.description}`,
    "",
    stripMdx(item.body),
    "",
    "---",
  ]);

  return doc(head, posts);
}

export function llmsPost(config: LlmsPostConfig): Response {
  const { post, site, link } = config;
  const { title, description, pubDate, category } = post.data;

  return doc(
    `# ${title}`,
    "",
    `> ${description}`,
    "",
    ...postMeta(site, link, pubDate, category),
    "",
    stripMdx(post.body ?? ""),
  );
}

function toLlmsItem(post: BlogPost, formatUrl: (slug: string) => string): LlmsItem {
  return {
    title: post.data.title,
    description: post.data.description,
    link: formatUrl(post.id),
  };
}

export function postsToLlmsItems(
  posts: BlogPost[],
  formatUrl: (slug: string) => string,
): LlmsItem[] {
  return posts.map((post) => toLlmsItem(post, formatUrl));
}

export function postsToLlmsFullItems(
  posts: BlogPost[],
  formatUrl: (slug: string) => string,
): LlmsFullItem[] {
  return posts.map((post) => ({
    ...toLlmsItem(post, formatUrl),
    pubDate: post.data.pubDate,
    category: post.data.category,
    body: post.body ?? "",
  }));
}
