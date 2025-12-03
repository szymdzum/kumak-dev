import type { APIRoute } from "astro";
import { siteConfig } from "@/site-config";
import { trackLlmsRequest } from "@utils/analytics";
import { llmsPost } from "@utils/llms";
import { formatUrl } from "@utils/path";
import { getAllPosts } from "@utils/posts";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  trackLlmsRequest({
    url: `/llms/${post.slug}.txt`,
    userAgent: request.headers.get("user-agent") ?? undefined,
    referrer: request.headers.get("referer") ?? undefined,
  });

  return llmsPost({
    post,
    site: siteConfig.url,
    link: formatUrl(post.slug),
  });
};
