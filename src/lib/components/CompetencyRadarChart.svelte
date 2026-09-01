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

  const WIDTH = 520;
  const HEIGHT = 400;
  const CENTER_X = WIDTH / 2;
  const CENTER_Y = HEIGHT / 2 - 10;
  const RADIUS = 110;
  const LABEL_RADIUS = RADIUS + 32;
  const LINE_HEIGHT = 12;

  function pointFor(index: number, count: number, fraction: number): { x: number; y: number } {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    return {
      x: CENTER_X + Math.cos(angle) * RADIUS * fraction,
      y: CENTER_Y + Math.sin(angle) * RADIUS * fraction,
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

  /** Break a long theme name into short lines so it never overruns the chart's side margins. */
  function wrapLabel(label: string): string[] {
    if (label.length <= 18) return [label];
    const words = label.includes(',') ? label.split(',').map((s) => s.trim()) : label.split(' ');
    const lines: string[] = [];
    for (const word of words) {
      const last = lines[lines.length - 1];
      if (last && last.length + word.length + 1 <= 12) {
        lines[lines.length - 1] = `${last} ${word}`;
      } else {
        lines.push(word);
      }
    }
    return lines;
  }

  const labelPoints = $derived(
    themes.map((theme, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / themes.length;
      const x = CENTER_X + Math.cos(angle) * LABEL_RADIUS;
      const y = CENTER_Y + Math.sin(angle) * LABEL_RADIUS;
      const anchor = Math.cos(angle) > 0.15 ? 'start' : Math.cos(angle) < -0.15 ? 'end' : 'middle';
      const lines = wrapLabel(theme);
      const startDy = -((lines.length - 1) * LINE_HEIGHT) / 2;
      return { theme, x, y, anchor, lines, startDy };
    }),
  );

  /**
   * Every axis shares the same center point, so a literal 0 (or "no data") fraction plots every
   * such vertex on top of each other — the polygon collapses into a spike toward whichever axis
   * has a real value instead of a readable shape. A small floor keeps every vertex visible.
   */
  const MIN_FRACTION = 0.05;

  function seriesPolygon(s: Series): string {
    return themes
      .map((theme, i) => {
        const value = s.valuesByTheme[theme];
        const fraction = value == null ? MIN_FRACTION : Math.max(value / maxScore, MIN_FRACTION);
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
  <svg viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-label="Radar chart of average score by theme">
    {#each gridRings as ring (ring)}
      <polygon points={ring} class="grid-ring" />
    {/each}
    {#each axisPoints as p, i (i)}
      <line x1={CENTER_X} y1={CENTER_Y} x2={p.x} y2={p.y} class="axis-line" />
    {/each}
    {#each visibleSeries as s (s.label)}
      <polygon points={seriesPolygon(s)} class="series-fill" style="fill: {s.color}; stroke: {s.color};" />
    {/each}
    {#each labelPoints as lp (lp.theme)}
      <text x={lp.x} y={lp.y} text-anchor={lp.anchor} class="axis-label">
        {#each lp.lines as line, i (i)}
          <tspan x={lp.x} dy={i === 0 ? lp.startDy : LINE_HEIGHT}>{line}</tspan>
        {/each}
      </text>
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
    max-width: 480px;
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
