import type { APIRoute } from "astro";
import { siteConfig } from "@/site-config";
import { trackLlmsRequest } from "@utils/analytics";
import { llmsPost } from "@utils/llms";
import { formatUrl } from "@utils/path";
import { getAllPosts } from "@utils/posts";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const posts = await getAllPosts();
  const post = posts.find((p) => p.id === params.slug);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  trackLlmsRequest(request, `/llms/${post.id}.txt`);

  return llmsPost({
    post,
    site: siteConfig.url,
    link: formatUrl(post.id),
  });
};
