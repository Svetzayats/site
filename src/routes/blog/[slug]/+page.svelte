<script lang="ts">
  import type { PageData } from "./$types";
  import { resolve } from "$app/paths";

  let { data }: { data: PageData } = $props();
  const post = $derived(data.post);
</script>

<svelte:head>
  <title>{post.title} — svetzayats</title>
  {#if post.excerpt}
    <meta name="description" content={post.excerpt} />
  {/if}
</svelte:head>

<div class="container">
  <article>
    <header class="post-header">
      <a href={resolve("/blog")} class="back-link">← Blog</a>
      <h1>{post.title}</h1>
      <div class="post-meta">
        {#if post.date}<time>{post.date}</time>{/if}
        {#if post.tags.length > 0}
          <span class="tags">
            {#each post.tags as tag (tag)}
              <span class="tag">{tag}</span>
            {/each}
          </span>
        {/if}
      </div>
    </header>

    <div class="prose">
      {@html post.html}
    </div>
  </article>
</div>

<style>
  .container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .post-header {
    padding-block: 2.5rem 2rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 2.5rem;
  }

  .back-link {
    display: inline-block;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 1.25rem;
  }

  .back-link:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  h1 {
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.25;
    margin-bottom: 1rem;
  }

  .post-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  .tags {
    display: flex;
    gap: 0.4rem;
  }

  .tag {
    background: var(--color-gray-1);
    color: var(--color-accent-high);
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
  }

  /* prose styles are in app.css */
</style>
