import { generateOGImage } from "../src/lib/og-image.ts";
import * as path from "jsr:@std/path@1.1.2";
import * as fs from "jsr:@std/fs@1.0.19";

interface BlogPost {
  slug: string;
  title: string;
  pubDate: Date;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  const contentDir = path.join(Deno.cwd(), "src", "content", "blog");

  for await (const entry of fs.walk(contentDir, { exts: [".md", ".mdx"] })) {
    if (!entry.isFile) continue;

    const content = await Deno.readTextFile(entry.path);
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const titleMatch = frontmatter.match(/title:\s*["']([^"']+)["']/);
      const dateMatch = frontmatter.match(/pubDate:\s*["'](\d{4}-\d{2}-\d{2})["']/);

      if (titleMatch && dateMatch) {
        const slug = path.basename(entry.path, path.extname(entry.path));
        posts.push({
          slug,
          title: titleMatch[1].trim(),
          pubDate: new Date(dateMatch[1]),
        });
      }
    }
  }

  return posts;
}

async function generateImages() {
  const posts = await getBlogPosts();
  const publicDir = path.join(Deno.cwd(), "public", "og");

  // Ensure og directory exists
  await fs.ensureDir(publicDir);

  // Generate home page OG image
  console.log("Generating home page OG image...");
  const homeImage = await generateOGImage({
    title: "The Null Hypothesis",
    description: "Where decade of code meet moments of clarity.",
  });
  await Deno.writeFile(path.join(publicDir, "home.png"), homeImage);
  console.log("✓ Generated: og/home.png");

  // Generate OG images for each blog post
  for (const post of posts) {
    const { title, pubDate, slug } = post;

    console.log(`Generating OG image for: ${slug}`);

    const ogImage = await generateOGImage({
      title,
      date: pubDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });

    await Deno.writeFile(path.join(publicDir, `${slug}.png`), ogImage);
    console.log(`✓ Generated: og/${slug}.png`);
  }

  console.log(`\n✓ Generated ${posts.length + 1} OG images`);
}

generateImages().catch(console.error);
