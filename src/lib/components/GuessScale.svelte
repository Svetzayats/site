<script lang="ts">
  import { getCultureCountry } from "$lib/data/culture-countries";
  import { dragState } from "$lib/drag.svelte";

  interface ScalePosition {
    code: string;
    position: number;
  }

  interface Props {
    title: string;
    leftLabel: string;
    rightLabel: string;
    caption: string;
    countries: ScalePosition[];
    guesses: Map<string, number>;
    revealed: boolean;
    armedCode: string | null;
    onPointerDown: (code: string, e: PointerEvent) => void;
    onArm: (code: string) => void;
    onTrackClick: (e: MouseEvent) => void;
    onToggleReveal: () => void;
    onReset: () => void;
  }

  let {
    title,
    leftLabel,
    rightLabel,
    caption,
    countries,
    guesses,
    revealed,
    armedCode,
    onPointerDown,
    onArm,
    onTrackClick,
    onToggleReveal,
    onReset,
  }: Props = $props();

  const hovered = $derived(dragState.current?.hoveredScale === title);

  const revealedCountries = $derived(
    countries.filter((c) => guesses.has(c.code)),
  );
</script>

<div class="scale">
  <h3 class="scale-title">{title}</h3>

  <div class="scale-labels">
    <span class="scale-label">{leftLabel}</span>
    <span class="scale-label">{rightLabel}</span>
  </div>

  <div
    class="drop-zone"
    class:hover={hovered}
    data-guess-track
    data-scale-title={title}
    onclick={onTrackClick}
    role="presentation"
  >
    <div class="scale-track">
      {#if revealed}
        {#each revealedCountries as country (country.code)}
          {@const guessPos = guesses.get(country.code) ?? 0}
          {@const left = Math.min(guessPos, country.position)}
          {@const width = Math.abs(country.position - guessPos)}
          <div
            class="connector"
            style="left: {left}%; width: {width}%"
          ></div>
        {/each}
      {/if}

      {#each guesses as [code, position] (code)}
        {@const info = getCultureCountry(code)}
        {#if info}
          <button
            type="button"
            class="badge guess"
            class:armed={armedCode === code}
            class:revealed
            style="left: {position}%; --badge-color: {info.color};"
            title={info.name}
            onpointerdown={(e) => onPointerDown(code, e)}
            onclick={(e) => {
              e.stopPropagation();
              onArm(code);
            }}
          >
            {info.code}
          </button>
        {/if}
      {/each}

      {#if revealed}
        {#each revealedCountries as country (country.code)}
          {@const info = getCultureCountry(country.code)}
          {#if info}
            <span
              class="badge real"
              style="left: {country.position}%; --badge-color: {info.color};"
              title={info.name}
            >
              {info.code}
            </span>
          {/if}
        {/each}
      {/if}
    </div>
  </div>

  <p class="scale-caption">{caption}</p>

  <div class="scale-controls">
    <button
      type="button"
      class="control"
      onclick={onToggleReveal}
      disabled={guesses.size === 0}
    >
      {revealed ? "Hide results" : "Show results"}
    </button>
    <button
      type="button"
      class="control"
      onclick={onReset}
      disabled={guesses.size === 0}
    >
      Reset
    </button>
  </div>
</div>

<style>
  .scale {
    padding-block: 0.5rem;
    margin-block-end: 3rem;
  }

  .scale-title {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.2rem;
    letter-spacing: -0.01em;
    color: var(--color-text);
    margin-bottom: 0.3rem;
    text-align: center;
  }

  .scale-labels {
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .drop-zone {
    padding-block: 2rem;
    margin: 0 0.75rem;
    border-radius: var(--radius-md);
    outline: 2px dashed transparent;
    outline-offset: 4px;
    transition:
      background 0.15s ease,
      outline-color 0.15s ease;
  }

  .drop-zone.hover {
    background: var(--color-accent-low);
    outline-color: var(--color-accent);
  }

  .scale-track {
    position: relative;
    height: 4px;
    background: var(--color-gray-1);
    border-radius: var(--radius-sm);
  }

  .connector {
    position: absolute;
    top: 50%;
    height: 1px;
    background: var(--color-border-strong);
    transform: translateY(-50%);
  }

  .badge {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: var(--badge-color);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    padding: 0;
    cursor: default;
  }

  .badge.guess {
    border: 2px dashed var(--color-bg);
    opacity: 0.9;
    cursor: grab;
    touch-action: none;
  }

  .badge.guess:active {
    cursor: grabbing;
  }

  .badge.guess.armed {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }

  .badge.guess.revealed {
    background: color-mix(in srgb, var(--badge-color) 35%, white);
    border-color: var(--color-border);
    color: var(--color-text-muted);
    opacity: 1;
  }

  .badge.real {
    border: 2px solid var(--color-bg);
  }

  .scale-caption {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    text-align: center;
    line-height: 1.5;
  }

  .scale-controls {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .control {
    padding: 0.3rem 0.8rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    font-size: 0.78rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      color 0.15s ease;
  }

  .control:hover:not(:disabled) {
    border-color: var(--color-border-strong);
    color: var(--color-text);
  }

  .control:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
