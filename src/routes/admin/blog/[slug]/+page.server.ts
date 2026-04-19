import { getPost } from "$lib/server/blog";
import { githubGet, githubPut } from "$lib/server/github";
import { titleWords } from "$lib/slug";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

function postPath(slug: string) {
  return `src/content/blog/${slug}.md`;
}

async function uniqueSlug(title: string, token: string): Promise<string> {
  const words = titleWords(title);
  let count = Math.min(3, words.length);
  let candidate = words.slice(0, count).join("-");

  while (await githubGet(postPath(candidate), token)) {
    if (count >= words.length) break;
    count++;
    candidate = words.slice(0, count).join("-");
  }

  let n = 2;
  const base = candidate;
  while (await githubGet(postPath(candidate), token)) {
    candidate = `${base}-${n++}`;
  }

  return candidate;
}

export const load: PageServerLoad = async ({ params, platform }) => {
  const token = platform?.env?.GITHUB_TOKEN;

  if (params.slug === "new") {
    return {
      slug: "",
      title: "",
      date: "",
      tags: "",
      excerpt: "",
      body: "",
      sha: null,
      isNew: true,
    };
  }

  const [post, file] = await Promise.all([
    Promise.resolve(getPost(params.slug)),
    token ? githubGet(postPath(params.slug), token) : Promise.resolve(null),
  ]);

  return {
    slug: params.slug,
    title: post?.title ?? "",
    date: post?.date ?? "",
    tags: post?.tags.join(", ") ?? "",
    excerpt: post?.excerpt ?? "",
    body: post ? post.raw.replace(/^---[\s\S]*?---\n*/, "").trimStart() : "",
    sha: file?.sha ?? null,
    isNew: false,
  };
};

export const actions: Actions = {
  save: async ({ request, params, platform }) => {
    const token = platform?.env?.GITHUB_TOKEN;
    if (!token) return fail(500, { error: "GITHUB_TOKEN not configured" });

    const formData = await request.formData();
    const title = ((formData.get("title") as string) ?? "").trim();
    const body = ((formData.get("body") as string) ?? "").trim();
    const tags = ((formData.get("tags") as string) ?? "").trim();
    const date = ((formData.get("date") as string) ?? "").trim();
    const excerpt = ((formData.get("excerpt") as string) ?? "").trim();
    let sha = ((formData.get("sha") as string) ?? "").trim();
    const isNew = params.slug === "new";

    const tagsArray = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const frontmatter = [
      "---",
      `title: ${title}`,
      `date: ${date}`,
      `tags: [${tagsArray.join(", ")}]`,
      `excerpt: ${excerpt}`,
      "---",
    ].join("\n");
    const fullContent = `${frontmatter}\n\n${body}\n`;

    if (isNew) {
      const manualSlug = ((formData.get("slug") as string) ?? "").trim();
      if (!manualSlug && !title)
        return fail(400, {
          error: "Cannot generate slug — add a title first.",
        });
      const slug = await uniqueSlug(manualSlug || title, token);
      const ok = await githubPut(
        postPath(slug),
        token,
        fullContent,
        `Add post: ${title || slug}`,
      );
      if (!ok) return fail(500, { error: "GitHub save failed" });
      return { success: true, slug };
    }

    if (!sha) {
      const existing = await githubGet(postPath(params.slug), token);
      sha = existing?.sha ?? "";
    }
    if (!sha)
      return fail(500, { error: "Could not get file SHA from GitHub." });

    const ok = await githubPut(
      postPath(params.slug),
      token,
      fullContent,
      `Update post: ${title || params.slug}`,
      sha,
    );
    if (!ok) return fail(500, { error: "GitHub save failed" });

    return { success: true, slug: params.slug };
  },
};
