<script lang="ts">
  import { CULTURE_COUNTRIES } from "$lib/data/culture-countries";

  interface Props {
    armedCode: string | null;
    onPointerDown: (code: string, e: PointerEvent) => void;
    onArm: (code: string) => void;
  }

  let { armedCode, onPointerDown, onArm }: Props = $props();
</script>

<div class="tray">
  <p class="tray-hint">
    Drag a country onto a scale to guess where it falls — or tap a country,
    then tap a spot on the scale.
  </p>

  <div class="tray-chips">
    {#each CULTURE_COUNTRIES as country (country.code)}
      <button
        type="button"
        class="chip"
        class:armed={armedCode === country.code}
        onpointerdown={(e) => onPointerDown(country.code, e)}
        onclick={() => onArm(country.code)}
      >
        <span class="badge" style="background: {country.color};"
          >{country.code}</span
        >
        {country.name}
      </button>
    {/each}
  </div>
</div>

<style>
  .tray {
    margin-bottom: 2rem;
  }

  .tray-hint {
    font-size: 0.82rem;
    color: var(--color-text-muted);
    margin-bottom: 0.75rem;
  }

  .tray-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .chip {
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
    cursor: grab;
    touch-action: none;
    transition:
      border-color 0.15s ease,
      background 0.15s ease,
      color 0.15s ease;
  }

  .chip:active {
    cursor: grabbing;
  }

  .chip:hover {
    border-color: var(--color-border-strong);
  }

  .chip.armed {
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
