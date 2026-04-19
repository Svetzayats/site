---
title: Hello World — What This Blog Is About
date: 2026-04-18
tags: [meta, writing, web]
excerpt: A first post to test headings, images, callouts, code blocks, and other content types you'll find here.
---

Welcome to my blog. This is a place where I write about web development, things I'm learning, and occasionally non-technical stuff that's on my mind.

This post exists to show what content looks like — headings, images, callouts, code. Think of it as a style reference.

---

## Why I'm Writing

Writing things down forces clarity. Half the time I start writing a post and realize I don't actually understand the thing I thought I understood. That process is the point.

I also want a place that's mine — not a Substack, not a Medium, not a thread. Just a page I control.

---

## What You'll Find Here

### Technical posts

Deep dives into SvelteKit, Cloudflare Workers, TypeScript patterns. Things I figured out the hard way and want to have a reference for.

### Short notes

Smaller observations. A library I found useful, a mental model that clicked, a weird bug and how I fixed it.

### Other stuff

I'm a person, not a content machine. Some posts will be about books, language learning, or whatever I'm currently obsessed with.

---

## A Code Example

Here's the kind of code that shows up on this blog — a simple SvelteKit server load function:

```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const post = getPost(params.slug);
  if (!post) {
    error(404, 'Post not found');
  }
  return { post };
};
```

Inline code looks like this: `import.meta.glob` is how SvelteKit reads files at build time.

---

## Callouts

> [!NOTE]
> This is a note callout. Use it for supplementary information that's useful but not critical to the main point.

> [!TIP]
> This is a tip. Good for actionable advice or shortcuts.

> [!WARNING]
> This is a warning. Use it when something can go wrong if the reader isn't careful.

---

## An Image

![A placeholder illustration](https://placehold.co/780x400/ebc9f3/4e0e5b?text=image+placeholder)

Images are full-width on this blog, with a subtle caption style when you add one below.

---

## Lists

Things I'm currently using:

- **SvelteKit** for the framework
- **Cloudflare Workers** for hosting
- **D1** for the database
- **CodeMirror** for the blog editor

Steps to deploy a Cloudflare Worker:

1. Run `pnpm build`
2. Run `wrangler deploy`
3. Check the dashboard
4. Regret nothing

---

## Blockquote

> "Programs must be written for people to read, and only incidentally for machines to execute."
> — Harold Abelson

---

That's it for the style reference. Real posts will be more focused than this one.
