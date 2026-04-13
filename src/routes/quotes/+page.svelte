<script lang="ts">
  import QuoteCard from "$lib/components/QuoteCard.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let search = $state('');
  let activeTags = $state<Set<string>>(new Set());
  let favoritesOnly = $state(false);

  const filtered = $derived.by(() => {
    const q = search.trim().toLowerCase();
    return data.quotes.filter((quote) => {
      if (favoritesOnly && !quote.favorite) return false;
      if (activeTags.size > 0 && !quote.tags.some((t) => activeTags.has(t))) return false;
      if (q) {
        const haystack = [quote.text, quote.author, quote.source ?? '', ...quote.tags]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  });

  function toggleTag(tag: string) {
    const next = new Set(activeTags);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    activeTags = next;
  }
</script>

<svelte:head>
  <title>Quotes — svetzayats</title>
</svelte:head>

<div class="container">
  <header class="page-header">
    <h1 class="page-title">Quotes</h1>
    <p class="page-subtitle">
      Just some quotes I found interesting enough to copy-paste.
    </p>
  </header>

  <div class="filters">
    <input
      class="search-input"
      type="search"
      placeholder="Search quotes…"
      bind:value={search}
      aria-label="Search quotes"
    />
    <button
      class="favorites-toggle"
      class:active={favoritesOnly}
      type="button"
      onclick={() => (favoritesOnly = !favoritesOnly)}
      aria-pressed={favoritesOnly}
    >
      ★ Favorites only
    </button>
  </div>

  {#if data.quotes.length === 0}
    <p class="empty-state">No quotes yet.</p>
  {:else if filtered.length === 0}
    <p class="empty-state">No quotes match your filters.</p>
  {:else}
    <ul class="quotes-grid" aria-label="Quotes">
      {#each filtered as quote (quote.id)}
        <li>
          <a
            href="/quotes/{quote.id}"
            class="card-link"
            aria-label="Read quote by {quote.author}"
          >
            <QuoteCard {quote} onTagClick={toggleTag} activeTagFilter={activeTags} />
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
    padding: 3rem 0 2rem;
  }

  .page-title {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
    color: var(--color-text-muted);
  }

  /* ── Filters ─────────────────────────────────── */
  .filters {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
    padding: 1.25rem 0 2rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 2rem;
  }

  .search-input {
    flex: 1;
    min-width: 180px;
    padding: 0.55rem 0.9rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 0.925rem;
    color: var(--color-text);
    background: var(--color-bg);
    outline: none;
    transition: border-color 0.15s ease;
  }

  .search-input:focus {
    border-color: var(--color-accent);
  }

  .search-input::placeholder {
    color: var(--color-gray-3);
  }

  .favorites-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.55rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-bg);
    color: var(--color-text-muted);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
    white-space: nowrap;
  }

  .favorites-toggle:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .favorites-toggle.active {
    background: var(--color-accent-low);
    border-color: var(--color-accent);
    color: var(--color-accent-high);
  }

  /* ── Grid ────────────────────────────────────── */
  .empty-state {
    color: var(--color-text-muted);
    padding: 3rem 0;
    text-align: center;
  }

  .quotes-grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
    padding-bottom: 4rem;
  }

  .card-link {
    display: block;
    color: inherit;
    height: 100%;
  }

  .card-link:hover {
    text-decoration: none;
  }

  .card-link:hover :global(.quote-card) {
    border-color: var(--color-accent);
    box-shadow: 0 4px 16px rgba(167, 0, 195, 0.08);
  }

  @media (max-width: 640px) {
    .quotes-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 500px) {
    .page-header {
      padding-top: 2rem;
    }

    .filters {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
