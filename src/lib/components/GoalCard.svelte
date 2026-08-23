<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Goal } from '$lib/server/goals';

  interface Props {
    goal: Goal;
    readOnly?: boolean;
    isOverdue?: boolean;
    isDueThisWeek?: boolean;
    overdueStepIds?: Set<string>;
    dueSoonStepIds?: Set<string>;
    open?: boolean;
    onEdit?: (goal: Goal) => void;
  }

  let {
    goal,
    readOnly = false,
    isOverdue = false,
    isDueThisWeek = false,
    overdueStepIds,
    dueSoonStepIds,
    open = false,
    onEdit,
  }: Props = $props();

  const STATUS_LABEL: Record<Goal['status'], string> = {
    not_started: 'Not started',
    in_progress: 'In progress',
    completed: 'Completed',
    abandoned: 'Abandoned',
  };

  const smartChecklist = $derived([
    { label: 'Specific', checked: goal.isSpecific },
    { label: 'Measurable', checked: goal.isMeasurable },
    { label: 'Achievable', checked: goal.isAchievable },
    { label: 'Relevant', checked: goal.isRelevant },
    { label: 'Time-bound', checked: goal.isTimeBound },
  ]);

  function formatDate(iso: string): string {
    return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' });
  }
</script>

<details class="goal-card" {open}>
  <summary>
    <span class="goal-title">{goal.title}</span>
    <span class="status-badge status-{goal.status}">{STATUS_LABEL[goal.status]}</span>
    {#if goal.targetDate}
      <span class="target-date">Due {formatDate(goal.targetDate)}</span>
    {/if}
    {#if isOverdue}
      <span class="flag-badge flag-overdue">Overdue</span>
    {:else if isDueThisWeek}
      <span class="flag-badge flag-due-soon">Due this week</span>
    {/if}
  </summary>

  <div class="goal-body">
    {#if goal.purpose}
      <div class="field-block">
        <h4>Purpose</h4>
        <p>{goal.purpose}</p>
      </div>
    {/if}

    {#if goal.challenges}
      <div class="field-block">
        <h4>Challenges</h4>
        <p>{goal.challenges}</p>
      </div>
    {/if}

    <div class="field-block">
      <h4>SMART checklist</h4>
      <ul class="smart-checklist">
        {#each smartChecklist as item (item.label)}
          <li class:checked={item.checked}>{item.label}</li>
        {/each}
      </ul>
    </div>

    {#if goal.steps.length > 0}
      <div class="field-block">
        <h4>Key steps</h4>
        <ul class="steps">
          {#each goal.steps as step (step.id)}
            <li class="step" class:done={step.done}>
              {#if readOnly}
                <span class="step-checkbox" aria-hidden="true">{step.done ? '☑' : '☐'}</span>
              {:else}
                <form method="POST" action="?/toggleGoalStep" use:enhance>
                  <input type="hidden" name="id" value={goal.id} />
                  <input type="hidden" name="stepId" value={step.id} />
                  <button type="submit" class="step-checkbox" aria-label="Toggle done">
                    {step.done ? '☑' : '☐'}
                  </button>
                </form>
              {/if}
              <span class="step-description">{step.description}</span>
              {#if step.dueDate}
                <span class="step-date">
                  Due {formatDate(step.dueDate)}
                  {#if !step.done && overdueStepIds?.has(step.id)}
                    <span class="flag-badge flag-overdue">Overdue</span>
                  {:else if !step.done && dueSoonStepIds?.has(step.id)}
                    <span class="flag-badge flag-due-soon">Due this week</span>
                  {/if}
                </span>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <div class="field-block">
      <h4>Progress log</h4>
      {#if goal.progressLog.length === 0}
        <p class="empty-hint">No progress logged yet.</p>
      {:else}
        <ul class="progress-log">
          {#each goal.progressLog as entry (entry.id)}
            <li><span class="log-date">{formatDate(entry.date)}</span> — {entry.note}</li>
          {/each}
        </ul>
      {/if}

      {#if !readOnly}
        <form method="POST" action="?/addGoalProgressEntry" use:enhance class="log-form">
          <input type="hidden" name="id" value={goal.id} />
          <input type="date" name="date" required />
          <input type="text" name="note" placeholder="What happened?" required />
          <button type="submit">Add</button>
        </form>
      {/if}
    </div>

    {#if !readOnly}
      <div class="goal-actions">
        <button type="button" class="link-btn" onclick={() => onEdit?.(goal)}>Edit</button>
        <form method="POST" action="?/deleteGoal" use:enhance>
          <input type="hidden" name="id" value={goal.id} />
          <button type="submit" class="link-btn danger">Delete</button>
        </form>
      </div>
    {/if}
  </div>
</details>

<style>
  .goal-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
  }

  summary {
    cursor: pointer;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem;
    font-weight: 600;
    color: var(--color-accent-high);
  }

  .goal-title {
    flex: 1 1 auto;
    min-width: 0;
  }

  .target-date {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .status-badge,
  .flag-badge {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-lg);
    white-space: nowrap;
  }

  .status-not_started {
    background: var(--color-surface-2);
    color: var(--color-text-soft);
  }

  .status-in_progress {
    background: var(--color-accent-low);
    color: var(--color-accent-high);
  }

  .status-completed {
    background: color-mix(in srgb, #10b981 15%, var(--color-bg));
    color: #047857;
  }

  .status-abandoned {
    background: color-mix(in srgb, #dc2626 12%, var(--color-bg));
    color: #b91c1c;
  }

  .flag-overdue {
    background: color-mix(in srgb, #dc2626 15%, var(--color-bg));
    color: #b91c1c;
  }

  .flag-due-soon {
    background: color-mix(in srgb, #d97706 15%, var(--color-bg));
    color: #b45309;
  }

  .goal-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 0.85rem;
  }

  .field-block h4 {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-soft);
    margin-bottom: 0.4rem;
  }

  .field-block p {
    font-size: 0.9rem;
    color: var(--color-text);
    white-space: pre-wrap;
  }

  .smart-checklist {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .smart-checklist li {
    font-size: 0.8rem;
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface-2);
    color: var(--color-text-soft);
  }

  .smart-checklist li.checked {
    background: var(--color-accent-low);
    color: var(--color-accent-high);
    font-weight: 600;
  }

  .steps,
  .progress-log {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .step {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.875rem;
    padding: 0.4rem 0.5rem;
    background: var(--color-surface-2);
    border-radius: var(--radius-sm);
  }

  .step.done .step-description {
    text-decoration: line-through;
    color: var(--color-text-muted);
  }

  .step-checkbox {
    background: none;
    border: none;
    padding: 0;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    color: var(--color-accent-high);
  }

  .step-description {
    flex: 1 1 auto;
  }

  .step-date {
    font-size: 0.78rem;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: 0.4rem;
    white-space: nowrap;
  }

  .progress-log {
    font-size: 0.875rem;
  }

  .log-date {
    font-weight: 600;
    color: var(--color-text-soft);
  }

  .empty-hint {
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  .log-form {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.6rem;
    flex-wrap: wrap;
  }

  .log-form input[type='date'] {
    flex: 0 0 auto;
  }

  .log-form input[type='text'] {
    flex: 1 1 200px;
  }

  .log-form input {
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 0.85rem;
    background: var(--color-bg);
    color: var(--color-text);
  }

  .log-form button {
    padding: 0.4rem 0.9rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    cursor: pointer;
  }

  .goal-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .link-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--color-accent);
    font-size: 0.85rem;
    cursor: pointer;
    text-decoration: underline;
  }

  .link-btn.danger {
    color: #dc2626;
  }
</style>
