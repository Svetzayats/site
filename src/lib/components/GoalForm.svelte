<script lang="ts">
  import { enhance } from '$app/forms';
  import { untrack } from 'svelte';
  import type { Goal, GoalStatus, GoalVisibility } from '$lib/server/goals';

  interface Props {
    goal: Goal | null;
    action: string;
    error?: string;
    onCancel?: () => void;
    onSubmitted?: () => void;
  }

  let { goal, action, error, onCancel, onSubmitted }: Props = $props();

  interface EditableStep {
    id: string;
    description: string;
    startDate: string;
    dueDate: string;
    done: boolean;
  }

  let title = $state(untrack(() => goal?.title ?? ''));
  let purpose = $state(untrack(() => goal?.purpose ?? ''));
  let challenges = $state(untrack(() => goal?.challenges ?? ''));
  let isSpecific = $state(untrack(() => goal?.isSpecific ?? false));
  let isMeasurable = $state(untrack(() => goal?.isMeasurable ?? false));
  let isAchievable = $state(untrack(() => goal?.isAchievable ?? false));
  let isRelevant = $state(untrack(() => goal?.isRelevant ?? false));
  let isTimeBound = $state(untrack(() => goal?.isTimeBound ?? false));
  let targetDate = $state(untrack(() => goal?.targetDate ?? ''));
  let status = $state<GoalStatus>(untrack(() => goal?.status ?? 'not_started'));
  let visibility = $state<GoalVisibility>(untrack(() => goal?.visibility ?? 'private'));

  let steps = $state<EditableStep[]>(
    untrack(() =>
      (goal?.steps ?? []).map((s) => ({
        id: s.id,
        description: s.description,
        startDate: s.startDate ?? '',
        dueDate: s.dueDate ?? '',
        done: s.done,
      })),
    ),
  );

  function addStep() {
    steps.push({ id: crypto.randomUUID(), description: '', startDate: '', dueDate: '', done: false });
  }

  function removeStep(id: string) {
    steps = steps.filter((s) => s.id !== id);
  }

  const stepsJson = $derived(JSON.stringify(steps));
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
  class="goal-form"
>
  {#if goal}<input type="hidden" name="id" value={goal.id} />{/if}
  <input type="hidden" name="stepsJson" value={stepsJson} />

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <div class="field">
    <label class="field-label" for="goal-title">Goal statement</label>
    <textarea id="goal-title" name="title" rows="2" bind:value={title} required
    ></textarea>
  </div>

  <div class="field">
    <label class="field-label" for="goal-purpose">Purpose</label>
    <textarea
      id="goal-purpose"
      name="purpose"
      rows="2"
      placeholder="Why is this relevant? What are the benefits?"
      bind:value={purpose}
    ></textarea>
  </div>

  <div class="field">
    <label class="field-label" for="goal-challenges">Challenges</label>
    <textarea
      id="goal-challenges"
      name="challenges"
      rows="2"
      placeholder="What challenges need to be overcome? What resources/skills are needed?"
      bind:value={challenges}
    ></textarea>
  </div>

  <fieldset class="smart-fieldset">
    <legend>SMART checklist</legend>
    <label><input type="checkbox" name="is_specific" bind:checked={isSpecific} /> Specific</label>
    <label><input type="checkbox" name="is_measurable" bind:checked={isMeasurable} /> Measurable</label>
    <label><input type="checkbox" name="is_achievable" bind:checked={isAchievable} /> Achievable</label>
    <label><input type="checkbox" name="is_relevant" bind:checked={isRelevant} /> Relevant</label>
    <label><input type="checkbox" name="is_time_bound" bind:checked={isTimeBound} /> Time-bound</label>
  </fieldset>

  <div class="field-row">
    <div class="field">
      <label class="field-label" for="goal-target-date">Completion date</label>
      <input id="goal-target-date" type="date" name="targetDate" bind:value={targetDate} />
    </div>

    <div class="field">
      <label class="field-label" for="goal-status">Status</label>
      <select id="goal-status" name="status" bind:value={status}>
        <option value="not_started">Not started</option>
        <option value="in_progress">In progress</option>
        <option value="completed">Completed</option>
        <option value="abandoned">Abandoned</option>
      </select>
    </div>

    <div class="field">
      <label class="field-label" for="goal-visibility">Visibility</label>
      <select id="goal-visibility" name="visibility" bind:value={visibility}>
        <option value="private">Private (only me)</option>
        <option value="public">Public (visible to reviewers)</option>
      </select>
    </div>
  </div>

  <div class="field">
    <span class="field-label">Key steps</span>
    <div class="steps-editor">
      {#each steps as step (step.id)}
        <div class="step-row">
          <input type="text" bind:value={step.description} placeholder="Step description" required />
          <input type="date" bind:value={step.startDate} title="Start date" />
          <input type="date" bind:value={step.dueDate} title="Due date" />
          <label class="step-done"><input type="checkbox" bind:checked={step.done} /> Done</label>
          <button type="button" class="remove-step-btn" onclick={() => removeStep(step.id)}>Remove</button>
        </div>
      {/each}
      <button type="button" class="add-step-btn" onclick={addStep}>+ Add step</button>
    </div>
  </div>

  <div class="form-actions">
    <button type="submit" class="submit-btn">{goal ? 'Save changes' : 'Create goal'}</button>
    {#if onCancel}
      <button type="button" class="cancel-btn" onclick={onCancel}>Cancel</button>
    {/if}
  </div>
</form>

<style>
  .goal-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1rem 1.1rem;
  }

  .error {
    font-size: 0.875rem;
    color: #dc2626;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .field-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .field-row .field {
    flex: 1 1 160px;
  }

  .field-label {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  textarea,
  input[type='text'],
  input[type='date'],
  select {
    padding: 0.55rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 0.9rem;
    color: var(--color-text);
    background: var(--color-bg);
    resize: vertical;
  }

  textarea:focus,
  input:focus,
  select:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: -1px;
  }

  .smart-fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0.75rem 1rem;
  }

  .smart-fieldset legend {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-soft);
    padding: 0 0.35rem;
  }

  .smart-fieldset label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.875rem;
  }

  .steps-editor {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .step-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .step-row input[type='text'] {
    flex: 1 1 200px;
  }

  .step-done {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .add-step-btn,
  .remove-step-btn {
    background: none;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    cursor: pointer;
    align-self: flex-start;
  }

  .remove-step-btn {
      align-self: center;
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .submit-btn {
    align-self: flex-start;
    padding: 0.6rem 1.4rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
  }

  .submit-btn:hover {
    background: var(--color-accent-high);
  }

  .cancel-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.875rem;
    cursor: pointer;
    text-decoration: underline;
  }
</style>
