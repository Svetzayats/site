<script lang="ts">
  import QuoteCard from '$lib/components/QuoteCard.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const { quote } = data;

  const ogDescription = quote.text.length > 200
    ? quote.text.slice(0, 197) + '…'
    : quote.text;

  let copyLabel = $state('Copy link');

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(location.href);
      copyLabel = 'Copied!';
      setTimeout(() => (copyLabel = 'Copy link'), 2000);
    } catch {
      copyLabel = 'Copy failed';
      setTimeout(() => (copyLabel = 'Copy link'), 2000);
    }
  }
</script>

<svelte:head>
  <title>{quote.author} — Quotes</title>
  <meta property="og:title" content={quote.author} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:url" content={`https://svetzayats.com/quotes/${quote.id}`} />
</svelte:head>

<div class="container">
  <nav class="breadcrumb">
    <a href="/quotes">← Quotes</a>
  </nav>

  <div class="card-wrap">
    <QuoteCard {quote} />
  </div>

  <div class="actions">
    <button class="btn-action" type="button" onclick={copyLink}>
      {copyLabel}
    </button>
  </div>
</div>

<style>
  .container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .breadcrumb {
    padding: 2rem 0 1.5rem;
  }

  .breadcrumb a {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    transition: color 0.15s ease;
  }

  .breadcrumb a:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  .card-wrap {
    max-width: 600px;
  }

  .card-wrap :global(.quote-card) {
    padding: 2.25rem;
  }

  .card-wrap :global(.quote-text) {
    font-size: 1.25rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-bottom: 4rem;
    flex-wrap: wrap;
  }

  .btn-action {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-bg);
    color: var(--color-text-muted);
    font-family: inherit;
    font-size: 0.925rem;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .btn-action:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
</style>
