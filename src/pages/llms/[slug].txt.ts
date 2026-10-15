import type { APIRoute } from "astro";
import { trackLlmsRequest } from "@utils/analytics";
import { llmsPost } from "@utils/llms";
import { llmsUrl } from "@utils/path";
import { getAllPosts } from "@utils/posts";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const posts = await getAllPosts();
  const post = posts.find((p) => p.id === params.slug);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const tracked = trackLlmsRequest(request, llmsUrl(post.id));
  const response = llmsPost(post);

  await tracked;
  return response;
};
