<script lang="ts">
  import type { CompetencyRow } from '$lib/data/competency-matrix';
  import type { Answer } from '$lib/server/competency-matrix';

  interface Props {
    competencies: CompetencyRow[];
    title: string;
    answers: Answer[];
    open?: boolean;
  }

  let { competencies, title, answers, open = false }: Props = $props();

  const byId = $derived(new Map(competencies.map((c) => [c.id, c])));

  const RATING_LABEL: Record<string, string> = {
    below: 'Not yet at level',
    at: 'At level',
    above: 'Exceeding level',
  };

  function skillLabel(competencyId: string): string {
    const row = byId.get(competencyId);
    return row ? (row.skill ?? row.area) : competencyId;
  }

  const grouped = $derived.by(() => {
    const workOn: Answer[] = [];
    const goingWell: Answer[] = [];
    for (const answer of answers) {
      (answer.rating === 'below' ? workOn : goingWell).push(answer);
    }
    return { workOn, goingWell };
  });
</script>

<details class="snapshot" {open}>
  <summary>{title}</summary>

  {#if answers.length > 0}
    <div class="summary">
      <div class="summary-col summary-work-on">
        <h4>Areas to work on</h4>
        {#if grouped.workOn.length === 0}
          <p class="summary-empty">Nothing below level.</p>
        {:else}
          <ul>
            {#each grouped.workOn as answer (answer.competencyId)}
              <li>{skillLabel(answer.competencyId)}</li>
            {/each}
          </ul>
        {/if}
      </div>
      <div class="summary-col summary-going-well">
        <h4>Going well</h4>
        {#if grouped.goingWell.length === 0}
          <p class="summary-empty">Nothing at or above level yet.</p>
        {:else}
          <ul>
            {#each grouped.goingWell as answer (answer.competencyId)}
              <li>{skillLabel(answer.competencyId)}</li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  {/if}

  <ul class="answers">
    {#each answers as answer (answer.competencyId)}
      {@const row = byId.get(answer.competencyId)}
      <li class="answer">
        <div class="answer-head">
          <span class="skill-name">{row ? (row.skill ?? row.area) : answer.competencyId}</span>
          <span class="rating-badge rating-{answer.rating}">
            {answer.level ?? RATING_LABEL[answer.rating] ?? answer.rating}
          </span>
        </div>
        {#if answer.accomplishments}
          <p class="notes"><strong>Accomplishments:</strong> {answer.accomplishments}</p>
        {/if}
        {#if answer.opportunities}
          <p class="notes"><strong>Opportunities:</strong> {answer.opportunities}</p>
        {/if}
        {#if answer.notes}
          <p class="notes"><strong>Notes:</strong> {answer.notes}</p>
        {/if}
      </li>
    {/each}
  </ul>
</details>

<style>
  .snapshot {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
  }

  summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--color-accent-high);
  }

  .summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
    margin-top: 0.85rem;
  }

  .summary-col {
    border-radius: var(--radius-sm);
    padding: 0.6rem 0.75rem;
  }

  .summary-work-on {
    background: color-mix(in srgb, #dc2626 8%, var(--color-bg));
  }

  .summary-going-well {
    background: color-mix(in srgb, #10b981 8%, var(--color-bg));
  }

  .summary-col h4 {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-soft);
    margin-bottom: 0.4rem;
  }

  .summary-col ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
    color: var(--color-text);
  }

  .summary-empty {
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  .answers {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.85rem;
  }

  .answer {
    padding: 0.5rem 0.65rem;
    background: var(--color-surface-2);
    border-radius: var(--radius-sm);
  }

  .answer-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.875rem;
  }

  .skill-name {
    font-weight: 500;
  }

  .rating-badge {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-lg);
    white-space: nowrap;
  }

  .rating-below {
    background: color-mix(in srgb, #dc2626 12%, var(--color-bg));
    color: #b91c1c;
  }

  .rating-at {
    background: var(--color-accent-low);
    color: var(--color-accent-high);
  }

  .rating-above {
    background: color-mix(in srgb, #10b981 15%, var(--color-bg));
    color: #047857;
  }

  .notes {
    margin-top: 0.4rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
    white-space: pre-wrap;
  }
</style>
