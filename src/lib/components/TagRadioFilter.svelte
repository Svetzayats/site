<script lang="ts">
  interface Props {
    items: readonly string[];
    selected: string | null;
    onSelect: (item: string | null) => void;
  }

  let { items, selected, onSelect }: Props = $props();

  function handleClick(item: string) {
    onSelect(selected === item ? null : item);
  }
</script>

<div class="filter-bar">
  <button
    type="button"
    class="show-all"
    class:active={selected === null}
    aria-pressed={selected === null}
    onclick={() => onSelect(null)}
  >
    Show all
  </button>

  {#each items as item (item)}
    <button
      type="button"
      class="item-toggle"
      class:active={selected === item}
      aria-pressed={selected === item}
      onclick={() => handleClick(item)}
    >
      {item}
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
  .item-toggle {
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
  .item-toggle:hover {
    border-color: var(--color-border-strong);
  }

  .show-all.active,
  .item-toggle.active {
    background: var(--color-accent-low);
    border-color: var(--color-accent);
    color: var(--color-accent-high);
  }
</style>
