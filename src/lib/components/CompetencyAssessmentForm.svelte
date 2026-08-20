<script lang="ts">
  import { enhance } from '$app/forms';
  import { diffWords } from '$lib/diff-words';
  import { LEVELS, LEVEL_META, type CompetencyRow, type Level } from '$lib/data/competency-matrix';
  import type { Answer } from '$lib/server/competency-matrix';

  interface Props {
    competencies: CompetencyRow[];
    level: Level;
    nextLevel: Level | null;
    action: string;
    submitLabel: string;
    hiddenFields?: Record<string, string>;
    error?: string;
    onSubmitted?: () => void;
    /** Someone else's answers to show alongside each question, e.g. the self-assessment a reviewer is reviewing against. */
    referenceAnswers?: Map<string, Answer>;
    referenceLabel?: string;
  }

  let {
    competencies,
    level,
    nextLevel,
    action,
    submitLabel,
    hiddenFields = {},
    error,
    onSubmitted,
    referenceAnswers,
    referenceLabel = 'Self-assessment',
  }: Props = $props();

  const REFERENCE_RATING_LABEL: Record<string, string> = {
    below: 'Not yet at level',
    at: 'At level',
    above: 'Exceeding level',
  };

  const grouped = $derived.by(() => {
    const groups: { theme: string; rows: CompetencyRow[] }[] = [];
    for (const row of competencies) {
      const group = groups.find((g) => g.theme === row.theme);
      if (group) {
        group.rows.push(row);
      } else {
        groups.push({ theme: row.theme, rows: [row] });
      }
    }
    return groups;
  });
</script>

<form
  method="POST"
  {action}
  use:enhance={() => {
    return async ({ update }) => {
      await update();
      onSubmitted?.();
    };
  }}
  class="assessment-form"
>
  <input type="hidden" name="level" value={level} />
  {#each Object.entries(hiddenFields) as [name, value] (name)}
    <input type="hidden" {name} {value} />
  {/each}

  {#if error}
    <p class="error">{error}</p>
  {/if}

  {#each grouped as { theme, rows } (theme)}
    <section class="theme-group">
      <h3 class="theme-title">{theme}</h3>

      {#each rows as row (row.id)}
        <fieldset class="skill-block">
          <legend>{row.skill ?? row.area}</legend>

          <div class="hints">
            <div class="hint">
              <span class="hint-label">{level} — current</span>
              <p>{row.descriptions[level]}</p>
            </div>
            {#if nextLevel}
              <div class="hint hint-next">
                <span class="hint-label">{nextLevel} — next</span>
                <p>
                  {#each diffWords(row.descriptions[level], row.descriptions[nextLevel]) as segment, si (si)}
                    {#if segment.changed}<mark>{segment.text}</mark>{:else}{segment.text}{/if}
                  {/each}
                </p>
              </div>
            {:else}
              <div class="hint">
                <span class="hint-label">Top level</span>
                <p>This is the highest level on the matrix — no "next" to compare against.</p>
              </div>
            {/if}
          </div>

          <div class="level-select-group">
            <label class="level-select-label" for="level_{row.id}">Level</label>
            <select id="level_{row.id}" name="level_{row.id}" required>
              <option value="" disabled selected>Select level</option>
              {#each LEVELS as lvl (lvl)}
                <option value={lvl}>{lvl} — {LEVEL_META[lvl].title}</option>
              {/each}
            </select>
          </div>

          <textarea
            name="notes_{row.id}"
            rows="2"
            placeholder="What evidence supports this rating? What would it take to reach the next level?"
          ></textarea>

          {#if referenceAnswers}
            {@const ref = referenceAnswers.get(row.id)}
            {#if ref}
              <details class="reference-answer">
                <summary class="reference-label">{referenceLabel}</summary>
                <div class="reference-body">
                  <span class="reference-rating rating-{ref.rating}">
                    {ref.level ?? REFERENCE_RATING_LABEL[ref.rating] ?? ref.rating}
                  </span>
                  {#if ref.notes}
                    <p class="reference-notes">{ref.notes}</p>
                  {/if}
                </div>
              </details>
            {/if}
          {/if}
        </fieldset>
      {/each}
    </section>
  {/each}

  <button type="submit" class="submit-btn">{submitLabel}</button>
</form>

<style>
  .assessment-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .error {
    font-size: 0.875rem;
    color: #dc2626;
  }

  .theme-group {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .theme-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-accent-high);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .skill-block {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1rem 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .skill-block legend {
    font-weight: 600;
    padding: 0 0.35rem;
  }

  .hints {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .hint {
    background: var(--color-surface-2);
    border-radius: var(--radius-sm);
    padding: 0.55rem 0.75rem;
    font-size: 0.875rem;
  }

  .hint-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-soft);
    margin-bottom: 0.2rem;
  }

  .hint-next mark {
    background: none;
    color: inherit;
    font-weight: 700;
  }

  .reference-answer {
    background: var(--color-accent-low);
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .reference-label {
    display: block;
    cursor: pointer;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-accent-high);
  }

  .reference-body {
    margin-top: 0.5rem;
  }

  .reference-rating {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-lg);
    white-space: nowrap;
  }

  .reference-rating.rating-below {
    background: color-mix(in srgb, #dc2626 15%, var(--color-bg));
    color: #b91c1c;
  }

  .reference-rating.rating-at {
    background: color-mix(in srgb, var(--color-accent) 18%, var(--color-bg));
    color: var(--color-accent-high);
  }

  .reference-rating.rating-above {
    background: color-mix(in srgb, #10b981 18%, var(--color-bg));
    color: #047857;
  }

  .reference-notes {
    margin-top: 0.4rem;
    color: var(--color-text);
    white-space: pre-wrap;
  }

  .level-select-group {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .level-select-label {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .level-select-group select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 0.9rem;
    background: var(--color-bg);
    color: var(--color-text);
  }

  textarea {
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 0.9rem;
    color: var(--color-text);
    background: var(--color-bg);
    resize: vertical;
  }

  textarea:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: -1px;
  }

  .submit-btn {
    align-self: flex-start;
    padding: 0.7rem 1.5rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
  }

  .submit-btn:hover {
    background: var(--color-accent-high);
  }
</style>
