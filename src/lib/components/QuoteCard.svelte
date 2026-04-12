<script lang="ts">
  import type { Quote } from "$lib/server/quotes";

  interface Props {
    quote: Quote;
    onTagClick?: (tag: string) => void;
  }

  let { quote, onTagClick }: Props = $props();
</script>

<article class="quote-card">
  <blockquote class="quote-text">"{quote.text}"</blockquote>

  <footer class="quote-meta">
    {#if quote.author}
      <span class="quote-author">— {quote.author}</span>
    {/if}
    {#if quote.source}
      <span class="quote-source">{quote.source}</span>
    {/if}
  </footer>

  {#if quote.tags.length > 0 || quote.favorite}
    <div class="quote-footer">
      {#if quote.tags.length > 0}
        <ul class="tag-list" aria-label="Tags">
          {#each quote.tags as tag}
            <li>
              {#if onTagClick}
                <button
                  class="tag-chip"
                  type="button"
                  onclick={() => onTagClick(tag)}>{tag}</button
                >
              {:else}
                <span class="tag-chip">{tag}</span>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}

      {#if quote.favorite}
        <span class="favorite-icon" aria-label="Favorite" title="Favorite"
          >★</span
        >
      {/if}
    </div>
  {/if}
</article>

<style>
  .quote-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .quote-text {
    font-size: 1.1rem;
    line-height: 1.65;
    color: var(--color-text);
    font-style: italic;
    quotes: none;
  }

  .quote-meta {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .quote-author {
    font-size: 0.925rem;
    font-weight: 600;
    color: var(--color-accent);
  }

  .quote-source {
    font-size: 0.825rem;
    color: var(--color-text-muted);
  }

  .quote-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 0.25rem;
  }

  .tag-list {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tag-chip {
    display: inline-block;
    background: var(--color-accent-low);
    color: var(--color-accent-high);
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-lg);
    border: none;
    cursor: default;
    font-family: inherit;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  button.tag-chip {
    cursor: pointer;
  }

  button.tag-chip:hover {
    background: var(--color-accent);
    color: #fff;
  }

  .favorite-icon {
    color: var(--color-accent);
    font-size: 1.1rem;
    line-height: 1;
    flex-shrink: 0;
  }
</style>
