<script lang="ts">
  import type { PageData } from "./$types";
  import { resolve } from "$app/paths";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Blog — svetzayats</title>
</svelte:head>

<div class="container">
  <header class="page-header">
    <h1>Blog</h1>
    <p class="subtitle">Writing about web development and other things.</p>
  </header>

  {#if data.posts.length === 0}
    <p class="empty">No posts yet.</p>
  {:else}
    <ul class="post-list">
      {#each data.posts as post (post.slug)}
        <li class="post-item">
          <a href={resolve(`/blog/${post.slug}`)} class="post-link">
            <span class="post-title">{post.title}</span>
            {#if post.excerpt}
              <span class="post-excerpt">{post.excerpt}</span>
            {/if}
            <span class="post-meta">
              {#if post.date}<time>{post.date}</time>{/if}
              {#if post.tags.length > 0}
                <span class="tags">
                  {#each post.tags as tag (tag)}
                    <span class="tag">{tag}</span>
                  {/each}
                </span>
              {/if}
            </span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .page-header {
    padding-block: 3rem 2.5rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 2rem;
  }

  .page-header h1 {
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: -0.03em;
  }

  .subtitle {
    margin-top: 0.5rem;
    color: var(--color-text-muted);
    font-size: 1rem;
  }

  .empty {
    color: var(--color-text-muted);
  }

  .post-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .post-item {
    border-bottom: 1px solid var(--color-border);
  }

  .post-link {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding-block: 1.5rem;
    color: inherit;
    text-decoration: none;
  }

  .post-link:hover .post-title {
    color: var(--color-accent);
  }

  .post-title {
    font-size: 1.15rem;
    font-weight: 600;
    transition: color 0.15s ease;
  }

  .post-excerpt {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  .post-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: 0.15rem;
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
</style>
