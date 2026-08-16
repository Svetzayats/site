<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import TagFilter from './TagFilter.svelte';
  import { diffWords } from '$lib/diff-words';
  import type { CompetencyRow, Level, LevelMeta } from '$lib/data/competency-matrix';

  interface Props {
    competencies: CompetencyRow[];
    levels: readonly Level[];
    levelMeta: Record<Level, LevelMeta>;
  }

  let { competencies, levels, levelMeta }: Props = $props();

  function uniqueInOrder(values: string[]): string[] {
    return [...new Set(values)];
  }

  const themes = uniqueInOrder(competencies.map((row) => row.theme));
  const areas = uniqueInOrder(competencies.map((row) => row.area));

  // While everything is selected, clicking an item isolates it (solo).
  // Once a subset is selected, clicking toggles that item within the subset.
  function makeToggleSet(set: SvelteSet<string>, items: readonly string[]) {
    return (item: string) => {
      const allSelected = set.size === items.length;
      if (allSelected) {
        set.clear();
        set.add(item);
      } else if (set.has(item)) {
        set.delete(item);
      } else {
        set.add(item);
      }
    };
  }

  function makeShowAll(set: SvelteSet<string>, items: readonly string[]) {
    return () => {
      for (const item of items) {
        set.add(item);
      }
    };
  }

  const visibleLevels = new SvelteSet<string>(levels);
  const toggleLevel = makeToggleSet(visibleLevels, levels);
  const showAllLevels = makeShowAll(visibleLevels, levels);

  const visibleThemes = new SvelteSet<string>(themes);
  const toggleTheme = makeToggleSet(visibleThemes, themes);
  const showAllThemes = makeShowAll(visibleThemes, themes);

  const visibleAreas = new SvelteSet<string>(areas);
  const toggleArea = makeToggleSet(visibleAreas, areas);
  const showAllAreas = makeShowAll(visibleAreas, areas);

  const visibleLevelList = $derived(levels.filter((l) => visibleLevels.has(l)));
  const filteredCompetencies = $derived(
    competencies.filter((row) => visibleThemes.has(row.theme) && visibleAreas.has(row.area)),
  );

  let tableExpanded = $state(false);
</script>

<div class="matrix">
  <div class="filters">
    <div class="filter-row">
      <span class="filter-label">Theme</span>
      <TagFilter items={themes} visibleItems={visibleThemes} onToggle={toggleTheme} onShowAll={showAllThemes} />
    </div>
    <div class="filter-row">
      <span class="filter-label">Area</span>
      <TagFilter items={areas} visibleItems={visibleAreas} onToggle={toggleArea} onShowAll={showAllAreas} />
    </div>
    <div class="filter-row">
      <span class="filter-label">Level</span>
      <TagFilter items={levels} visibleItems={visibleLevels} onToggle={toggleLevel} onShowAll={showAllLevels} />
    </div>
  </div>

  <button
    type="button"
    class="table-toggle"
    aria-expanded={tableExpanded}
    onclick={() => (tableExpanded = !tableExpanded)}
  >
    {tableExpanded ? '▾ Hide table' : '▸ Show table'}
    <span class="table-toggle-count">({filteredCompetencies.length} skill{filteredCompetencies.length === 1 ? '' : 's'})</span>
  </button>

  {#if tableExpanded}
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th class="col-info">Skill</th>
            {#each visibleLevelList as level (level)}
              <th class="col-level">
                <span class="level-code">{level}</span>
                <span class="level-title">{levelMeta[level].title}</span>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#if filteredCompetencies.length === 0}
            <tr>
              <td class="empty-row" colspan={visibleLevelList.length + 1}>No skills match the current filters.</td>
            </tr>
          {/if}
          {#each filteredCompetencies as row (row.id)}
            <tr>
              <td class="col-info">
                <span class="info-theme">{row.theme}</span>
                <span class="info-name">{row.skill ?? row.area}</span>
                {#if row.skill}
                  <span class="info-area">{row.area}</span>
                {/if}
              </td>
              {#each visibleLevelList as level, i (level)}
                <td class="col-level">
                  {#if i === 0}
                    {row.descriptions[level]}
                  {:else}
                    {#each diffWords(row.descriptions[visibleLevelList[i - 1]], row.descriptions[level]) as segment, si (si)}
                      {#if segment.changed}<mark>{segment.text}</mark>{:else}{segment.text}{/if}
                    {/each}
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .matrix {
    width: 100%;
  }

  .filters {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-bottom: 1.25rem;
  }

  .filter-row {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
  }

  .filters .filter-row :global(.filter-bar) {
    margin-bottom: 0;
  }

  .filter-label {
    flex-shrink: 0;
    width: 3.5rem;
    padding-top: 0.38rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-soft);
  }

  .table-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.9rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface-2);
    color: var(--color-text);
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 1rem;
  }

  .table-toggle:hover {
    border-color: var(--color-accent);
    color: var(--color-accent-high);
  }

  .table-toggle-count {
    color: var(--color-text-muted);
    font-weight: 400;
  }

  .table-scroll {
    overflow-x: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    min-width: 760px;
  }

  th,
  td {
    padding: 0.75rem 0.9rem;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.875rem;
  }

  thead th {
    background: var(--color-surface);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
    position: sticky;
    top: 0;
  }

  .col-info {
    width: 160px;
  }

  .info-theme,
  .info-name,
  .info-area {
    display: block;
  }

  .info-theme {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-soft);
  }

  .info-name {
    font-weight: 600;
    color: var(--color-text);
    margin-top: 0.15rem;
  }

  .info-area {
    font-size: 0.78rem;
    color: var(--color-text-muted);
    margin-top: 0.1rem;
  }

  .col-level {
    width: auto;
    color: var(--color-text);
  }

  .col-level mark {
    background: none;
    color: inherit;
    font-weight: 700;
  }

  .empty-row {
    text-align: center;
    color: var(--color-text-muted);
    padding: 2rem 0.9rem;
  }

  .level-code {
    display: block;
    font-weight: 700;
    color: var(--color-accent-high);
  }

  .level-title {
    display: block;
    font-weight: 400;
    text-transform: none;
    letter-spacing: normal;
    color: var(--color-text-soft);
  }

  tbody tr:hover td {
    background: var(--color-surface-2);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
</style>
