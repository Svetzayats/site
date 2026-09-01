<script lang="ts">
  import { enhance } from '$app/forms';
  import { browser } from '$app/environment';
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
    /** Previously saved answers to prefill this form with, e.g. when re-opening a review for editing. */
    initialAnswers?: Map<string, Answer>;
    /** ISO timestamp of when initialAnswers was last saved server-side, used to ignore stale local drafts. */
    initialUpdatedAt?: string;
    /** Whether every skill must have a level selected before submit. Defaults to true (self-assessment). */
    requireAllAnswers?: boolean;
    /** localStorage key to autosave this form's in-progress values under. Omit to disable autosave. */
    draftKey?: string;
    skipLabel?: string;
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
    initialAnswers,
    initialUpdatedAt,
    requireAllAnswers = true,
    draftKey,
    skipLabel = 'Skip',
  }: Props = $props();

  const REFERENCE_RATING_LABEL: Record<string, string> = {
    below: 'Not yet at level',
    at: 'At level',
    above: 'Exceeding level',
    skip: 'Skipped',
  };

  let formEl: HTMLFormElement | undefined = $state();

  function collectFormValues(): Record<string, string> {
    if (!formEl) return {};
    const data = new FormData(formEl);
    const values: Record<string, string> = {};
    for (const [key, value] of data.entries()) {
      if (typeof value === 'string') values[key] = value;
    }
    return values;
  }

  function saveDraft() {
    if (!browser || !draftKey || !formEl) return;
    localStorage.setItem(
      draftKey,
      JSON.stringify({ savedAt: new Date().toISOString(), fields: collectFormValues() }),
    );
  }

  function restoreDraft() {
    if (!browser || !draftKey || !formEl) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { savedAt?: string; fields?: Record<string, string> };
      if (initialUpdatedAt && parsed.savedAt && parsed.savedAt <= initialUpdatedAt) return;
      for (const [name, value] of Object.entries(parsed.fields ?? {})) {
        const el = formEl.elements.namedItem(name);
        if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
          el.value = value;
        }
      }
    } catch {
      // corrupt draft, ignore
    }
  }

  function clearDraft() {
    if (browser && draftKey) localStorage.removeItem(draftKey);
  }

  $effect(() => {
    if (!browser || !draftKey || !formEl) return;
    restoreDraft();
    const interval = setInterval(saveDraft, 2000);
    return () => clearInterval(interval);
  });

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
  bind:this={formEl}
  use:enhance={() => {
    return async ({ result, update }) => {
      await update();
      if (result.type === 'success') {
        clearDraft();
        onSubmitted?.();
      }
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
        {@const initial = initialAnswers?.get(row.id)}
        {@const initialLevelValue = initial ? (initial.rating === 'skip' ? 'skip' : (initial.level ?? '')) : ''}
        <fieldset class="skill-block">
          <legend>{row.skill ?? row.area}</legend>

          <div class="hints">
            {#each LEVELS as lvl, i (lvl)}
              <div
                class="hint"
                class:hint-current={lvl === level}
                class:hint-next={lvl === nextLevel}
              >
                <span class="hint-label">
                  {lvl} — {LEVEL_META[lvl].title}{#if lvl === level}
                    {' '}(current){:else if lvl === nextLevel}
                    {' '}(next){/if}
                </span>
                <p>
                  {#if i === 0}
                    {row.descriptions[lvl]}
                  {:else}
                    {#each diffWords(row.descriptions[LEVELS[i - 1]], row.descriptions[lvl]) as segment, si (si)}
                      {#if segment.changed}<mark>{segment.text}</mark>{:else}{segment.text}{/if}
                    {/each}
                  {/if}
                </p>
              </div>
            {/each}
          </div>

          <div class="level-select-group">
            <label class="level-select-label" for="level_{row.id}">Level</label>
            <select id="level_{row.id}" name="level_{row.id}" required={requireAllAnswers} value={initialLevelValue}>
              <option value="" disabled>Select level</option>
              {#each LEVELS as lvl (lvl)}
                <option value={lvl}>{lvl} — {LEVEL_META[lvl].title}</option>
              {/each}
              <option value="skip">{skipLabel}</option>
            </select>
          </div>

          <div class="field">
            <label class="field-label" for="accomplishments_{row.id}">Accomplishments</label>
            <textarea
              id="accomplishments_{row.id}"
              name="accomplishments_{row.id}"
              rows="2"
              placeholder="Concrete evidence/examples backing up the level you picked."
              value={initial?.accomplishments ?? ''}
            ></textarea>
          </div>

          <div class="field">
            <label class="field-label" for="opportunities_{row.id}">Opportunities</label>
            <textarea
              id="opportunities_{row.id}"
              name="opportunities_{row.id}"
              rows="2"
              placeholder="What's needed to move up on this specific skill."
              value={initial?.opportunities ?? ''}
            ></textarea>
          </div>

          <div class="field">
            <label class="field-label" for="notes_{row.id}">Notes</label>
            <textarea
              id="notes_{row.id}"
              name="notes_{row.id}"
              rows="2"
              placeholder="Anything else worth noting."
              value={initial?.notes ?? ''}
            ></textarea>
          </div>

          {#if referenceAnswers}
            {@const ref = referenceAnswers.get(row.id)}
            {#if ref}
              <details class="reference-answer">
                <summary class="reference-label">{referenceLabel}</summary>
                <div class="reference-body">
                  <span class="reference-rating rating-{ref.rating}">
                    {ref.level ?? REFERENCE_RATING_LABEL[ref.rating] ?? ref.rating}
                  </span>
                  {#if ref.accomplishments}
                    <p class="reference-notes"><strong>Accomplishments:</strong> {ref.accomplishments}</p>
                  {/if}
                  {#if ref.opportunities}
                    <p class="reference-notes"><strong>Opportunities:</strong> {ref.opportunities}</p>
                  {/if}
                  {#if ref.notes}
                    <p class="reference-notes"><strong>Notes:</strong> {ref.notes}</p>
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

  .hint mark {
    background: none;
    color: inherit;
    font-weight: 700;
  }

  .hint-current {
    background: var(--color-accent-low);
    border: 1px solid var(--color-accent);
  }

  .hint-current .hint-label {
    color: var(--color-accent-high);
  }

  .hint-next {
    border: 1px dashed var(--color-accent);
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

  .reference-rating.rating-skip {
    background: color-mix(in srgb, var(--color-text-muted) 20%, var(--color-bg));
    color: var(--color-text-muted);
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

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .field-label {
    font-size: 0.875rem;
    color: var(--color-text-muted);
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
