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

const MDX_PATTERNS = [
  /^import\s+.+from\s+['"].+['"];?\s*$/gm,
  /<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>/g,
  /<[A-Z][a-zA-Z]*[^>]*\/>/g,
] as const;

function stripMdx(content: string): string {
  return MDX_PATTERNS.reduce((text, pattern) => text.replace(pattern, ""), content).trim();
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

export function postsToLlmsItems(
  posts: BlogPost[],
  formatUrl: (slug: string) => string,
): LlmsItem[] {
  return posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    link: formatUrl(post.id),
  }));
}

export function postsToLlmsFullItems(
  posts: BlogPost[],
  formatUrl: (slug: string) => string,
): LlmsFullItem[] {
  return posts.map((post) => ({
    ...postsToLlmsItems([post], formatUrl)[0],
    pubDate: post.data.pubDate,
    category: post.data.category,
    body: post.body ?? "",
  }));
}
