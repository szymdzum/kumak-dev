import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { siteConfig } from "@/site-config";
import { type Category, i18n, type Locale, localePath } from "@/i18n/ui";
import { trackRssRequest } from "./analytics";
import { getAllPosts, postPath } from "./posts";

/** GET handler for a language's feed: /rss.xml (English), /pl/rss.xml. */
export function rssRoute(locale: Locale): APIRoute {
  const { t } = i18n(locale);
  const feedPath = localePath(locale, "/rss.xml");

  return async ({ site, request }) => {
    if (!site) {
      throw new Error("site is not defined in astro.config.mjs");
    }

    const tracked = trackRssRequest(request, feedPath);
    const posts = await getAllPosts(locale);
    const response = await rss({
      title: siteConfig.name,
      description: t.tagline,
      // The channel link is the language's home; the stylesheet shows <link> + "rss.xml".
      site: new URL(localePath(locale, "/"), site).href,
      stylesheet: "/rss-styles.xsl",
      customData: `<language>${locale}</language>`,
      items: posts.map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        author: siteConfig.author.name,
        categories: [t.categories[post.data.category as Category]],
        link: postPath(post),
      })),
    });

    await tracked;
    return response;
  };
}
