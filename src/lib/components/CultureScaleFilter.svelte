<script lang="ts">
  import { CULTURE_COUNTRIES } from "$lib/data/culture-countries";

  interface Props {
    visibleCodes: Set<string>;
    onToggle: (code: string) => void;
    onShowAll: () => void;
  }

  let { visibleCodes, onToggle, onShowAll }: Props = $props();

  const allVisible = $derived(visibleCodes.size === CULTURE_COUNTRIES.length);
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

  {#each CULTURE_COUNTRIES as country (country.code)}
    <button
      type="button"
      class="country-toggle"
      class:active={visibleCodes.has(country.code)}
      aria-pressed={visibleCodes.has(country.code)}
      onclick={() => onToggle(country.code)}
    >
      <span class="badge" style="background: {country.color};"
        >{country.code}</span
      >
      {country.name}
    </button>
  {/each}
</div>

<style>
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 2.5rem;
  }

  .show-all,
  .country-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.75rem 0.35rem 0.4rem;
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

  .show-all {
    padding-inline: 0.9rem;
  }

  .show-all:hover,
  .country-toggle:hover {
    border-color: var(--color-border-strong);
  }

  .show-all.active,
  .country-toggle.active {
    background: var(--color-accent-low);
    border-color: var(--color-accent);
    color: var(--color-accent-high);
  }

  .badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    color: #fff;
    font-size: 0.6rem;
    font-weight: 600;
  }
</style>
