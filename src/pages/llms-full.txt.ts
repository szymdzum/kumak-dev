import type { APIRoute } from "astro";
import { trackLlmsRequest } from "@utils/analytics";
import { llmsFullTxt } from "@utils/llms";
import { getAllPosts } from "@utils/posts";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const tracked = trackLlmsRequest(request, "/llms-full.txt");
  const response = llmsFullTxt(await getAllPosts());

  await tracked;
  return response;
};
