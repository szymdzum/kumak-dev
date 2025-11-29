import type { BlogPost } from "./posts";

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

const MDX_PATTERNS = {
  imports: /^import\s+.+from\s+['"].+['"];?\s*$/gm,
  jsxBlocks: /<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>/g,
  jsxSelfClosing: /<[A-Z][a-zA-Z]*[^>]*\/>/g,
} as const;

function stripMdxSyntax(content: string): string {
  return Object.values(MDX_PATTERNS)
    .reduce((text, pattern) => text.replace(pattern, ""), content)
    .trim();
}

function textResponse(content: string): Response {
  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatLink(item: LlmsItem, site: string): string {
  return `- [${item.title}](${site}${item.link}): ${item.description}`;
}

function buildDocument(sections: string[][]): string {
  return sections.map((lines) => lines.join("\n")).join("\n\n");
}

export function llmsTxt(config: LlmsTxtConfig): Response {
  const header = [`# ${config.name}`, `> ${config.description}`];
  const posts = ["## Posts", ...config.items.map((item) => formatLink(item, config.site))];

  const sections = [header, posts];

  if (config.optional?.length) {
    const optional = [
      "## Optional",
      ...config.optional.map((item) => formatLink(item, config.site)),
    ];
    sections.push(optional);
  }

  return textResponse(buildDocument(sections) + "\n");
}

function formatPostSection(item: LlmsFullItem, site: string): string[] {
  return [
    `## ${item.title}`,
    "",
    `URL: ${site}${item.link}`,
    `Published: ${formatDate(item.pubDate)}`,
    `Category: ${item.category}`,
    "",
    `> ${item.description}`,
    "",
    stripMdxSyntax(item.body),
    "",
    "---",
  ];
}

export function llmsFullTxt(config: LlmsFullTxtConfig): Response {
  const header = [
    `# ${config.name}`,
    "",
    `> ${config.description}`,
    "",
    `Author: ${config.author}`,
    `Site: ${config.site}`,
    "",
    "---",
  ];

  const posts = config.items.flatMap((item) => formatPostSection(item, config.site));

  return textResponse([...header, "", ...posts, ""].join("\n"));
}

interface LlmsPostConfig {
  post: BlogPost;
  site: string;
  link: string;
}

export function llmsPost(config: LlmsPostConfig): Response {
  const { post, site, link } = config;
  const { title, description, pubDate, category } = post.data;

  const lines = [
    `# ${title}`,
    "",
    `> ${description}`,
    "",
    `URL: ${site}${link}`,
    `Published: ${formatDate(pubDate)}`,
    `Category: ${category}`,
    "",
    stripMdxSyntax(post.body ?? ""),
    "",
  ];

  return textResponse(lines.join("\n"));
}

export function postsToLlmsItems(
  posts: BlogPost[],
  formatUrl: (slug: string) => string,
): LlmsItem[] {
  return posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    link: formatUrl(post.slug),
  }));
}

export function postsToLlmsFullItems(
  posts: BlogPost[],
  formatUrl: (slug: string) => string,
): LlmsFullItem[] {
  return posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    link: formatUrl(post.slug),
    pubDate: post.data.pubDate,
    category: post.data.category,
    body: post.body ?? "",
  }));
}
