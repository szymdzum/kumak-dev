import type { APIRoute } from "astro";
import { siteConfig } from "@/site-config";
import { trackLlmsRequest } from "@utils/analytics";
import { llmsTxt, postsToLlmsItems } from "@utils/llms";
import { getAllPosts } from "@utils/posts";

export const prerender = false;

const formatLlmsUrl = (slug: string) => `/llms/${slug}.txt`;

export const GET: APIRoute = async ({ request }) => {
  const posts = await getAllPosts();

  trackLlmsRequest({
    url: "/llms.txt",
    userAgent: request.headers.get("user-agent") ?? undefined,
    referrer: request.headers.get("referer") ?? undefined,
  });

  return llmsTxt({
    name: siteConfig.name,
    description: siteConfig.description,
    site: siteConfig.url,
    items: postsToLlmsItems(posts, formatLlmsUrl),
    optional: [
      { title: "About", link: "/about", description: "About the author" },
      { title: "RSS Feed", link: "/rss.xml", description: "Subscribe to updates" },
      {
        title: "Full Content",
        link: "/llms-full.txt",
        description: "Complete post content for deeper context",
      },
    ],
  });
};
