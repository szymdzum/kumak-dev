import type { APIRoute } from "astro";
import { siteConfig } from "@/site-config";
import { trackLlmsRequest } from "@utils/analytics";
import { llmsFullTxt, postsToLlmsFullItems } from "@utils/llms";
import { formatUrl } from "@utils/path";
import { getAllPosts } from "@utils/posts";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const posts = await getAllPosts();

  trackLlmsRequest({
    url: "/llms-full.txt",
    userAgent: request.headers.get("user-agent") ?? undefined,
    referrer: request.headers.get("referer") ?? undefined,
  });

  return llmsFullTxt({
    name: siteConfig.name,
    description: siteConfig.description,
    author: siteConfig.author,
    site: siteConfig.url,
    items: postsToLlmsFullItems(posts, formatUrl),
  });
};
