<script lang="ts">
  import { getCultureCountry } from "$lib/data/culture-countries";

  interface ScalePosition {
    code: string;
    position: number; // 0–100, percent along the track
  }

  interface Props {
    title: string;
    leftLabel: string;
    rightLabel: string;
    caption: string;
    countries: ScalePosition[];
    visibleCodes: Set<string>;
  }

  let { title, leftLabel, rightLabel, caption, countries, visibleCodes }: Props =
    $props();

  const visible = $derived(
    countries.filter((c) => visibleCodes.has(c.code)),
  );
</script>

<div class="scale">
  <h3 class="scale-title">{title}</h3>

  <div class="scale-labels">
    <span class="scale-label">{leftLabel}</span>
    <span class="scale-label">{rightLabel}</span>
  </div>

  <div class="scale-track">
    {#each visible as country (country.code)}
      {@const info = getCultureCountry(country.code)}
      {#if info}
        <span
          class="badge"
          style="left: {country.position}%; background: {info.color};"
          title={info.name}
        >
          {info.code}
        </span>
      {/if}
    {/each}
  </div>

  <p class="scale-caption">{caption}</p>
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

  .scale-track {
    position: relative;
    height: 4px;
    margin: 2.5rem 0.75rem;
    background: var(--color-gray-1);
    border-radius: var(--radius-sm);
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
    border: 2px solid var(--color-bg);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .scale-caption {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    text-align: center;
    line-height: 1.5;
  }
</style>
