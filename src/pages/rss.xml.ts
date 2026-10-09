import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { siteConfig } from "@/site-config";
import { trackRssRequest } from "@utils/analytics";
import { formatUrl } from "@utils/path";
import { getAllPosts } from "@utils/posts";

export const prerender = false;

export const GET: APIRoute = async ({ site, request }) => {
  if (!site) {
    throw new Error("site is not defined in astro.config.mjs");
  }

  trackRssRequest(request.headers.get("user-agent") ?? undefined);

  const posts = await getAllPosts();

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site,
    stylesheet: "/rss-styles.xsl",
    customData: `<language>en</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      author: siteConfig.author,
      categories: [post.data.category],
      link: formatUrl(post.id),
    })),
  });
};
