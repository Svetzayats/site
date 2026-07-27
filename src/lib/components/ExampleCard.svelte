<script lang="ts">
  import { renderMarkdown } from "$lib/markdown";

  interface Props {
    tag: string;
    title: string;
    content: string;
    tilt?: string;
    wide?: boolean;
  }

  let { tag, title, content, tilt = "0deg", wide = false }: Props = $props();

  const html = $derived(renderMarkdown(content));
</script>

<article class="example-card" class:wide style="--tilt: {tilt};">
  <span class="example-pin">📌</span>
  {#if tag} <span class="example-tag">{tag}</span>{/if}
  <h3 class="example-title">{title}</h3>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- content is hardcoded markdown authored in this repo, not user input -->
  <div class="example-body">{@html html}</div>
</article>

<style>
  .example-card {
    position: relative;
    padding: 1.75rem 1.5rem 1.5rem;
    background: var(--color-surface-2);
    border: 1px dashed var(--color-border-strong);
    border-radius: var(--radius-md);
    box-shadow: 0 6px 16px rgba(78, 14, 91, 0.08);
    transform: rotate(var(--tilt, 0deg));
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .example-card:hover {
    transform: rotate(0deg) translateY(-4px);
    box-shadow: 0 12px 24px rgba(78, 14, 91, 0.14);
  }

  .example-card.wide {
    grid-column: span 2;
  }

  .example-pin {
    position: absolute;
    top: -0.9rem;
    left: 50%;
    transform: translateX(-50%) rotate(-10deg);
    font-size: 1.4rem;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
  }

  .example-tag {
    display: inline-block;
    background: var(--color-gray-1);
    color: var(--color-accent-high);
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-sm);
    font-size: 0.72rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .example-title {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.05rem;
    letter-spacing: -0.01em;
    margin-bottom: 0.6rem;
    color: var(--color-text);
  }

  .example-body {
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--color-text-muted);
  }

  .example-body :global(p) {
    margin: 0;
  }

  .example-body :global(p + p) {
    margin-top: 0.5rem;
  }

  .example-body :global(strong) {
    color: var(--color-text);
    font-weight: 600;
  }

  .example-body :global(a) {
    color: var(--color-accent);
  }

  .example-body :global(code) {
    background: var(--color-gray-1);
    color: var(--color-accent-high);
    padding: 0.1rem 0.35rem;
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 0.85em;
  }
</style>
