<script lang="ts">
  import QuoteCard from '$lib/components/QuoteCard.svelte';
  import { exportQuoteAsImage } from '$lib/image-export';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const { quote } = data;

  const ogDescription = quote.text.length > 200
    ? quote.text.slice(0, 197) + '…'
    : quote.text;

  let copyLabel = $state('Copy link');
  let imageLabel = $state('Copy as image');
  let imageError = $state<string | null>(null);

  let cardElement = $state<HTMLElement | null>(null);

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

  async function saveImage() {
    if (!cardElement) return;
    imageLabel = 'Working…';
    imageError = null;
    try {
      const result = await exportQuoteAsImage(cardElement, `quote-${quote.id}.png`);
      imageLabel = result === 'clipboard' ? 'Copied!' : 'Downloaded!';
      setTimeout(() => (imageLabel = 'Copy as image'), 2000);
    } catch (err) {
      imageError = err instanceof Error ? err.message : 'Failed to generate image';
      imageLabel = 'Copy as image';
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

  <div class="card-wrap" bind:this={cardElement}>
    <QuoteCard {quote} />
  </div>

  <div class="actions">
    <button class="btn-action" type="button" onclick={copyLink}>
      {copyLabel}
    </button>
    <button
      class="btn-action"
      type="button"
      onclick={saveImage}
      disabled={imageLabel === 'Working…'}
    >
      {imageLabel}
    </button>
  </div>

  {#if imageError}
    <p class="image-error" role="alert">{imageError}</p>
  {/if}
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

  .btn-action:hover:not(:disabled) {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .btn-action:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .image-error {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: #c0392b;
  }

  /* padding-bottom on the last child so footer has breathing room */
  .image-error,
  .actions {
    padding-bottom: 4rem;
  }
</style>
