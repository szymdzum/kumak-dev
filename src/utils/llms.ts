import type { APIRoute } from "astro";
import { siteConfig } from "@/site-config";
import type { Locale } from "@/i18n/ui";
import { trackLlmsRequest } from "./analytics";
import { type BlogPost, getAllPosts, isoDate, postLlmsPath, postPath, postSlug } from "./posts";

interface Link {
  title: string;
  description: string;
  href: string;
}

const OPTIONAL_LINKS: Link[] = [
  { title: "About", href: "/about", description: "About the author" },
  { title: "RSS Feed", href: "/rss.xml", description: "Subscribe to updates" },
  {
    title: "Full Content",
    href: "/llms-full.txt",
    description: "Complete post content for deeper context",
  },
];

// CommonMark fences: up to 3 spaces of indent; a closing fence has no info string
const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const MDX_IMPORT_EXPORT =
  /^(import\s.+\sfrom\s+["']|import\s+["']|export\s+(const|let|default|function|\{))/;
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
    const [, marker, info = ""] = line.match(FENCE) ?? [];

    if (fence) {
      const closes = marker !== undefined && marker[0] === fence[0] &&
        marker.length >= fence.length && !info.trim();
      if (closes) fence = null;
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

const header = [`# ${siteConfig.name}`, "", `> ${siteConfig.description}`];

function linkList(title: string, links: Link[]): string[] {
  return [
    "",
    `## ${title}`,
    ...links.map((link) => `- [${link.title}](${siteConfig.url}${link.href}): ${link.description}`),
  ];
}

function postMeta(post: BlogPost): string[] {
  return [
    `URL: ${siteConfig.url}${postPath(post)}`,
    `Published: ${isoDate(post.data.pubDate)}`,
    `Category: ${post.data.category}`,
  ];
}

/** llms.txt: index of posts as links to their plain-text versions. */
export function llmsTxt(posts: BlogPost[]): Response {
  const postLinks = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    href: postLlmsPath(post),
  }));
  return doc(header, linkList("Posts", postLinks), linkList("Optional", OPTIONAL_LINKS));
}

/** llms-full.txt: every post's content in one document. */
export function llmsFullTxt(posts: BlogPost[]): Response {
  const head = [
    ...header,
    "",
    `Author: ${siteConfig.author.name}`,
    `Site: ${siteConfig.url}`,
    "",
    "---",
  ];

  const sections = posts.flatMap((post) => [
    "",
    `## ${post.data.title}`,
    "",
    ...postMeta(post),
    "",
    `> ${post.data.description}`,
    "",
    stripMdx(post.body ?? ""),
    "",
    "---",
  ]);

  return doc(head, sections);
}

/** /llms/[slug].txt: a single post as plain Markdown. */
export function llmsPost(post: BlogPost): Response {
  return doc(
    `# ${post.data.title}`,
    "",
    `> ${post.data.description}`,
    "",
    ...postMeta(post),
    "",
    stripMdx(post.body ?? ""),
  );
}

/** GET handler for one post as plain text in a language: /llms/<slug>.txt, /pl/llms/<slug>.txt. */
export function llmsPostRoute(locale: Locale): APIRoute {
  return async ({ params, request }) => {
    const post = (await getAllPosts(locale)).find((p) => postSlug(p) === params.slug);

    if (!post) {
      return new Response("Not found", { status: 404 });
    }

    const tracked = trackLlmsRequest(request, postLlmsPath(post));
    const response = llmsPost(post);

    await tracked;
    return response;
  };
}
