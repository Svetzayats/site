<script lang="ts">
  interface Series {
    label: string;
    color: string;
    valuesByTheme: Record<string, number | null>;
  }

  interface Props {
    themes: string[];
    series: Series[];
    maxScore: number;
  }

  let { themes, series, maxScore }: Props = $props();

  const SIZE = 340;
  const CENTER = SIZE / 2;
  const RADIUS = 120;
  const LABEL_RADIUS = RADIUS + 34;

  function pointFor(index: number, count: number, fraction: number): { x: number; y: number } {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    return {
      x: CENTER + Math.cos(angle) * RADIUS * fraction,
      y: CENTER + Math.sin(angle) * RADIUS * fraction,
    };
  }

  const axisPoints = $derived(themes.map((_, i) => pointFor(i, themes.length, 1)));

  const gridRings = $derived(
    Array.from({ length: maxScore }, (_, ring) => {
      const fraction = (ring + 1) / maxScore;
      return themes
        .map((_, i) => {
          const p = pointFor(i, themes.length, fraction);
          return `${p.x},${p.y}`;
        })
        .join(' ');
    }),
  );

  const labelPoints = $derived(
    themes.map((theme, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / themes.length;
      const x = CENTER + Math.cos(angle) * LABEL_RADIUS;
      const y = CENTER + Math.sin(angle) * LABEL_RADIUS;
      const anchor = Math.cos(angle) > 0.15 ? 'start' : Math.cos(angle) < -0.15 ? 'end' : 'middle';
      return { theme, x, y, anchor };
    }),
  );

  function seriesPolygon(s: Series): string {
    return themes
      .map((theme, i) => {
        const value = s.valuesByTheme[theme];
        const fraction = value == null ? 0 : value / maxScore;
        const p = pointFor(i, themes.length, fraction);
        return `${p.x},${p.y}`;
      })
      .join(' ');
  }

  const visibleSeries = $derived(
    series.filter((s) => themes.some((theme) => s.valuesByTheme[theme] != null)),
  );
</script>

<div class="radar-chart">
  <svg viewBox="0 0 {SIZE} {SIZE}" role="img" aria-label="Radar chart of average score by theme">
    {#each gridRings as ring (ring)}
      <polygon points={ring} class="grid-ring" />
    {/each}
    {#each axisPoints as p, i (i)}
      <line x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} class="axis-line" />
    {/each}
    {#each visibleSeries as s (s.label)}
      <polygon points={seriesPolygon(s)} class="series-fill" style="fill: {s.color}; stroke: {s.color};" />
    {/each}
    {#each labelPoints as lp (lp.theme)}
      <text x={lp.x} y={lp.y} text-anchor={lp.anchor} class="axis-label">{lp.theme}</text>
    {/each}
  </svg>

  <ul class="legend">
    {#each visibleSeries as s (s.label)}
      <li>
        <span class="swatch" style="background: {s.color};"></span>
        {s.label}
      </li>
    {/each}
    {#if visibleSeries.length === 0}
      <li class="legend-empty">Not enough data yet.</li>
    {/if}
  </ul>
</div>

<style>
  .radar-chart {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  svg {
    width: 100%;
    max-width: 420px;
    height: auto;
  }

  .grid-ring {
    fill: none;
    stroke: var(--color-border);
    stroke-width: 1;
  }

  .axis-line {
    stroke: var(--color-border);
    stroke-width: 1;
  }

  .axis-label {
    font-size: 9.5px;
    fill: var(--color-text-muted);
  }

  .series-fill {
    fill-opacity: 0.22;
    stroke-width: 2;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    list-style: none;
    font-size: 0.85rem;
    color: var(--color-text);
  }

  .legend li {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .swatch {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 999px;
    display: inline-block;
  }

  .legend-empty {
    color: var(--color-text-muted);
  }
</style>
