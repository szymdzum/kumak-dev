import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { siteConfig } from "@/site-config";
import { formatUrl } from "@utils/path";
import { getAllPosts } from "@utils/posts";

export const GET: APIRoute = async (context) => {
  if (!context.site) {
    throw new Error("site is not defined in astro.config.mjs");
  }

  const posts = await getAllPosts();

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site,
    stylesheet: "/rss-styles.xsl",
    customData: `<language>en</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      author: siteConfig.author,
      categories: [post.data.category],
      link: formatUrl(post.slug),
    })),
  });
};
