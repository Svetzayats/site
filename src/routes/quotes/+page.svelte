<script lang="ts">
  import QuoteCard from "$lib/components/QuoteCard.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
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

  {#if data.quotes.length === 0}
    <p class="empty-state">No quotes yet.</p>
  {:else}
    <ul class="quotes-grid" aria-label="Quotes">
      {#each data.quotes as quote (quote.id)}
        <li>
          <a
            href="/quotes/{quote.id}"
            class="card-link"
            aria-label="Read quote by {quote.author}"
          >
            <QuoteCard {quote} />
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
    padding: 3rem 0 2.5rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 2.5rem;
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
  }
</style>
