<script lang="ts">
  import { onMount } from "svelte";
  import { resolve } from "$app/paths";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const post = $derived(data.post);
  const prev = $derived(data.prev);
  const next = $derived(data.next);

  let tocItems = $state<{ id: string; text: string }[]>([]);
  let activeId = $state("");
  let progress = $state(0);

  onMount(() => {
    const prose = document.getElementById("prose");
    if (prose) {
      const headings = [...prose.querySelectorAll("h2")];
      tocItems = headings.map((h) => ({ id: h.id, text: h.textContent ?? "" }));
    }

    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      progress = docH > 0 ? Math.min(100, (window.scrollY / docH) * 100) : 0;

      const offset = 120;
      let active = tocItems[0]?.id ?? "";
      for (const { id } of tocItems) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset < 0) active = id;
      }
      activeId = active;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  });

  function formatDate(d: string) {
    if (!d) return "";
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<svelte:head>
  <title>{post.title} — svetzayats</title>
  {#if post.excerpt}
    <meta name="description" content={post.excerpt} />
  {/if}
</svelte:head>

<div class="progress-bar" style="width: {progress}%"></div>

<div class="post-layout">
  <header class="post-header">
    <a href={resolve("/blog")} class="back-link">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg
      >
      All posts
    </a>

    {#if post.tags.length > 0}
      <div class="eyebrow-tags">
        {#each post.tags as tag}
          <a href={resolve("/blog")} class="tag">{tag}</a>
        {/each}
      </div>
    {/if}

    <h1 class="post-title">{post.title}</h1>

    {#if post.excerpt}
      <p class="post-dek">{post.excerpt}</p>
    {/if}

    <div class="post-meta">
      {#if post.date}
        <span class="meta-item">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line
              x1="16"
              y1="2"
              x2="16"
              y2="6"
            /><line x1="8" y1="2" x2="8" y2="6" /><line
              x1="3"
              y1="10"
              x2="21"
              y2="10"
            /></svg
          >
          {formatDate(post.date)}
        </span>
        <span class="meta-dot"></span>
      {/if}
      <span class="meta-item">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><circle cx="12" cy="12" r="10" /><polyline
            points="12 6 12 12 16 14"
          /></svg
        >
        {data.readingTime} min read
      </span>
    </div>
  </header>

  <div class="prose" id="prose">
    {@html post.html}
  </div>

  <footer class="post-footer">
    {#if prev || next}
      <nav class="pagination" aria-label="Post navigation">
        {#if prev}
          <a href={resolve(`/blog/${prev.slug}`)} class="pagination-card prev">
            <span class="pagination-dir">← Previous</span>
            <span class="pagination-title">{prev.title}</span>
          </a>
        {:else}
          <div></div>
        {/if}
        {#if next}
          <a href={resolve(`/blog/${next.slug}`)} class="pagination-card next">
            <span class="pagination-dir">Next →</span>
            <span class="pagination-title">{next.title}</span>
          </a>
        {/if}
      </nav>
    {/if}
  </footer>
</div>

<style>
  /* ─── Progress bar ─── */
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      var(--color-accent),
      var(--color-accent-high)
    );
    z-index: 100;
    transition: width 0.1s linear;
    pointer-events: none;
  }

  /* ─── 3-column grid layout ─── */
  .post-layout {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 1.75rem;
    display: grid;
    grid-template-columns: 1fr min(var(--content-width), 100%) 1fr;
    gap: 0 3rem;
    align-items: start;
    padding-bottom: var(--spacing-section);
  }

  .post-layout > * {
    grid-column: 2;
  }
  .toc {
    grid-column: 3;
  }

  @media (max-width: 1080px) {
    .post-layout {
      grid-template-columns: 1fr;
      gap: 0;
    }
    .toc {
      display: none;
    }
    .post-layout > * {
      grid-column: 1;
      max-width: var(--content-width);
      margin-inline: auto;
      width: 100%;
    }
  }

  /* ─── Post header ─── */
  .post-header {
    padding-block: 4rem 2.5rem;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin-bottom: 2.5rem;
    transition:
      gap 0.2s ease,
      color 0.15s ease;
  }
  .back-link:hover {
    gap: 0.7rem;
    color: var(--color-accent);
    text-decoration: none;
  }

  .eyebrow-tags {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin-bottom: 1.25rem;
  }

  .tag {
    background: var(--color-gray-1);
    color: var(--color-accent-high);
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-sm);
    font-size: 0.72rem;
    font-weight: 500;
    transition:
      background 0.15s,
      color 0.15s;
    text-decoration: none;
  }
  .tag:hover {
    background: var(--color-accent-low);
    text-decoration: none;
  }

  .post-title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(2.25rem, 4.5vw, 3.25rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--color-text);
    text-wrap: pretty;
    margin-bottom: 1.25rem;
  }

  .post-dek {
    font-size: 1.125rem;
    line-height: 1.55;
    color: var(--color-text-muted);
    margin-bottom: 2rem;
    text-wrap: pretty;
  }

  .post-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .meta-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--color-gray-2);
  }

  .meta-item {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .meta-item svg {
    width: 14px;
    height: 14px;
  }

  /* ─── TOC ─── */
  .toc {
    position: sticky;
    top: 100px;
    padding-top: 4rem;
    max-width: 220px;
  }

  .toc-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-soft, var(--color-text-muted));
    margin-bottom: 1rem;
  }

  .toc ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .toc a {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    display: block;
    padding: 0.2rem 0 0.2rem 0.85rem;
    border-left: 1px solid var(--color-border);
    line-height: 1.4;
    transition:
      color 0.15s,
      border-color 0.15s;
    text-decoration: none;
  }
  .toc a:hover {
    color: var(--color-accent);
    border-color: var(--color-accent-low);
  }
  .toc a.is-active {
    color: var(--color-text);
    border-left-color: var(--color-accent);
    font-weight: 500;
  }

  /* ─── Post footer ─── */
  .post-footer {
    margin-top: 4rem;
    padding-top: 2.5rem;
    border-top: 1px solid var(--color-border);
  }

  .share-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 2.5rem;
  }
  .share-label {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    font-weight: 500;
  }
  .share-actions {
    display: flex;
    gap: 0.5rem;
  }

  .share-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    cursor: pointer;
    transition:
      color 0.15s,
      border-color 0.15s,
      background 0.15s,
      transform 0.2s ease;
  }
  .share-btn:hover {
    color: var(--color-accent);
    border-color: var(--color-accent-low);
    background: var(--color-gray-1);
    transform: translateY(-1px);
  }
  .share-btn svg {
    width: 15px;
    height: 15px;
  }

  .author-card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1.1rem;
    align-items: center;
    padding: 1.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    margin-bottom: 2.5rem;
  }

  .avatar-lg {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      var(--color-accent-low),
      var(--color-accent)
    );
    display: grid;
    place-items: center;
    color: #fff;
    font-weight: 600;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .author-card-name {
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 0.15rem;
  }
  .author-card-bio {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.5;
  }
  .author-card-socials {
    display: flex;
    gap: 0.85rem;
    margin-top: 0.5rem;
  }
  .author-card-socials a {
    font-size: 0.8rem;
    color: var(--color-accent);
    font-weight: 500;
  }

  .pagination {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .pagination-card {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: inherit;
    transition:
      border-color 0.2s,
      transform 0.2s ease,
      background 0.2s;
  }
  .pagination-card:hover {
    border-color: var(--color-accent-low);
    background: var(--color-surface);
    text-decoration: none;
    transform: translateY(-2px);
  }
  .pagination-card.next {
    text-align: right;
  }

  .pagination-dir {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .pagination-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--color-text);
    text-wrap: pretty;
  }

  .pagination-card:hover .pagination-title {
    color: var(--color-accent);
  }

  @media (max-width: 600px) {
    .pagination {
      grid-template-columns: 1fr;
    }
    .pagination-card.next {
      text-align: left;
    }
  }
</style>
