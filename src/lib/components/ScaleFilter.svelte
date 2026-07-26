<script lang="ts">
  interface Props {
    scales: readonly string[];
    visibleScales: Set<string>;
    onToggle: (scale: string) => void;
    onShowAll: () => void;
  }

  let { scales, visibleScales, onToggle, onShowAll }: Props = $props();

  const allVisible = $derived(visibleScales.size === scales.length);
</script>

<div class="filter-bar">
  <button
    type="button"
    class="show-all"
    class:active={allVisible}
    aria-pressed={allVisible}
    onclick={onShowAll}
  >
    Show all
  </button>

  {#each scales as scale (scale)}
    <button
      type="button"
      class="scale-toggle"
      class:active={visibleScales.has(scale)}
      aria-pressed={visibleScales.has(scale)}
      onclick={() => onToggle(scale)}
    >
      {scale}
    </button>
  {/each}
</div>

<style>
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1.25rem;
  }

  .show-all,
  .scale-toggle {
    padding: 0.35rem 0.9rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      background 0.15s ease,
      color 0.15s ease;
  }

  .show-all:hover,
  .scale-toggle:hover {
    border-color: var(--color-border-strong);
  }

  .show-all.active,
  .scale-toggle.active {
    background: var(--color-accent-low);
    border-color: var(--color-accent);
    color: var(--color-accent-high);
  }
</style>
