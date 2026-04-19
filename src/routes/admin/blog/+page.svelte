<script lang="ts">
  import type { PageData } from "./$types";
  import { resolve } from "$app/paths";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Admin — Blog</title>
</svelte:head>

<div class="container">
  <header class="page-header">
    <h1>Blog posts</h1>
    <a href={resolve("/admin/blog/new")} class="btn-new">+ New post</a>
  </header>

  {#if data.posts.length === 0}
    <p class="empty">
      No posts yet. <a href={resolve("/admin/blog/new")}>Create one.</a>
    </p>
  {:else}
    <ul class="post-list">
      {#each data.posts as post (post.slug)}
        <li class="post-item">
          <div class="post-info">
            <span class="post-title">{post.title}</span>
            <span class="post-meta">
              {#if post.date}<time>{post.date}</time>{/if}
              {#if post.tags.length > 0}
                <span class="tags">{post.tags.join(", ")}</span>
              {/if}
            </span>
          </div>
          <div class="post-actions">
            <a
              href={resolve(`/blog/${post.slug}`)}
              target="_blank"
              class="action-link">View</a
            >
            <a href={resolve(`/admin/blog/${post.slug}`)} class="action-link"
              >Edit</a
            >
          </div>
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block: 2.5rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .btn-new {
    padding: 0.5rem 1rem;
    background: var(--color-accent);
    color: #fff;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
  }

  .btn-new:hover {
    background: var(--color-accent-high);
    text-decoration: none;
  }

  .empty {
    color: var(--color-text-muted);
    padding-top: 1rem;
  }

  .post-list {
    list-style: none;
    display: flex;
    flex-direction: column;
  }

  .post-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-block: 1.1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .post-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .post-title {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .post-meta {
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  .tags {
    margin-left: 0.5rem;
  }

  .post-actions {
    display: flex;
    gap: 1rem;
    flex-shrink: 0;
  }

  .action-link {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .action-link:hover {
    color: var(--color-accent);
  }
</style>
