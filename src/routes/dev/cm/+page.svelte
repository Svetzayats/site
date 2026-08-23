<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import CompetencyTable from '$lib/components/CompetencyTable.svelte';
  import CompetencyAssessmentForm from '$lib/components/CompetencyAssessmentForm.svelte';
  import CompetencySnapshotView from '$lib/components/CompetencySnapshotView.svelte';
  import CompetencyRadarChart from '$lib/components/CompetencyRadarChart.svelte';
  import GoalCard from '$lib/components/GoalCard.svelte';
  import GoalForm from '$lib/components/GoalForm.svelte';
  import { COMPETENCIES, LEVELS, LEVEL_META, MAX_LEVEL_SCORE, type Level } from '$lib/data/competency-matrix';
  import type { Goal } from '$lib/server/goals';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let editingGoal = $state<Goal | null>(null);
  let creatingGoal = $state(false);

  const REVIEWER_NAME_KEY = 'cm_reviewer_name';

  function nextLevel(level: Level): Level | null {
    const idx = LEVELS.indexOf(level);
    return idx >= 0 && idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  }

  let selfLevel = $state<Level>('E2');
  const selfNextLevel = $derived(nextLevel(selfLevel));

  let localReviewerName = $state<string | null>(data.reviewerName);
  let reviewerNameInput = $state('');

  onMount(() => {
    if (data.reviewerName) {
      if (localStorage.getItem(REVIEWER_NAME_KEY) !== data.reviewerName) {
        localStorage.setItem(REVIEWER_NAME_KEY, data.reviewerName);
      }
      return;
    }
    const stored = localStorage.getItem(REVIEWER_NAME_KEY);
    if (stored) {
      localReviewerName = stored;
      syncReviewerNameToUrl(stored);
    }
  });

  function syncReviewerNameToUrl(name: string) {
    goto(resolve(`/dev/cm?reviewerName=${encodeURIComponent(name)}`), {
      replaceState: true,
      invalidateAll: true,
      noScroll: true,
      keepFocus: true,
    });
  }

  function saveReviewerName(event: SubmitEvent) {
    event.preventDefault();
    const name = reviewerNameInput.trim();
    if (!name) return;
    localStorage.setItem(REVIEWER_NAME_KEY, name);
    localReviewerName = name;
    syncReviewerNameToUrl(name);
  }

  function forgetReviewerName() {
    localStorage.removeItem(REVIEWER_NAME_KEY);
    localReviewerName = null;
    reviewerNameInput = '';
  }

  const reviewLatestLevel = $derived(
    data.latestSelfAssessment ? (data.latestSelfAssessment.level as Level) : null,
  );
  const reviewNextLevel = $derived(reviewLatestLevel ? nextLevel(reviewLatestLevel) : null);
  const selfAssessmentAnswerMap = $derived(
    data.latestSelfAssessment
      ? new Map(data.latestSelfAssessment.answers.map((a) => [a.competencyId, a]))
      : undefined,
  );

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
</script>

<svelte:head>
  <title>Engineering IC Competency Matrix — svetzayats</title>
</svelte:head>

<div class="container">
  <header class="page-header">
    <h1 class="page-title">Engineering IC Competency Matrix</h1>
    <p class="page-subtitle">
      Browse the leveling matrix, run a self-evaluation, and collect reviewer feedback.
    </p>
  </header>

  <section class="block">
    <h2>Matrix</h2>
    <CompetencyTable competencies={COMPETENCIES} levels={LEVELS} levelMeta={LEVEL_META} />
  </section>

  <section class="block">
    <h2>Self-evaluation</h2>

    {#if !data.admin}
      <form method="POST" action="?/loginAdmin" use:enhance class="login-form">
        <p class="hint-text">Svetlana only.</p>
        {#if form?.adminError}
          <p class="error">{form.adminError}</p>
        {/if}
        <label>
          Password
          <input type="password" name="password" autocomplete="current-password" />
        </label>
        <button type="submit">Sign in</button>
      </form>
    {:else}
      <div class="level-picker">
        <label for="self-level">Level</label>
        <select id="self-level" bind:value={selfLevel}>
          {#each LEVELS as level (level)}
            <option value={level}>{level} — {LEVEL_META[level].title}</option>
          {/each}
        </select>
      </div>

      {#if form?.selfError}
        <p class="error">{form.selfError}</p>
      {/if}

      {#key selfLevel}
        <CompetencyAssessmentForm
          competencies={COMPETENCIES}
          level={selfLevel}
          nextLevel={selfNextLevel}
          action="?/submitSelfAssessment"
          submitLabel="Save self-assessment"
        />
      {/key}

      {#if data.radar}
        <div class="radar-section">
          <h3>Radar Results</h3>
          <p class="hint-text">
            Average score per theme (E1=0 … E6={MAX_LEVEL_SCORE}) for the latest self-assessment{data
              .radar.reviewer
              ? ' vs. reviewer average'
              : ''}.
          </p>
          <CompetencyRadarChart
            themes={data.radar.themes}
            maxScore={MAX_LEVEL_SCORE}
            series={[
              { label: 'Self', color: 'var(--color-accent)', valuesByTheme: data.radar.self },
              ...(data.radar.reviewer
                ? [{ label: 'Reviewer avg', color: '#10b981', valuesByTheme: data.radar.reviewer }]
                : []),
            ]}
          />
        </div>
      {/if}

      {#if data.selfAssessments.length > 0}
        <div class="history">
          <h3>History</h3>
          {#each data.selfAssessments as assessment, i (assessment.id)}
            <CompetencySnapshotView
              competencies={COMPETENCIES}
              title="{assessment.level} — {formatDate(assessment.created_at)}"
              answers={assessment.answers}
              open={i === 0}
            />
          {/each}
        </div>
      {/if}

      {#if data.allReviews.length > 0}
        <div class="history">
          <h3>Reviews from others</h3>
          {#each data.allReviews as review (review.id)}
            <CompetencySnapshotView
              competencies={COMPETENCIES}
              title="{review.reviewerName} — {formatDate(review.created_at)}"
              answers={review.answers}
            />
          {/each}
        </div>
      {/if}
    {/if}
  </section>

  {#if data.admin && data.selfAssessments.length > 0}
    <section class="block">
      <h2>Goals</h2>

      {#if data.focusItems.overdue.length > 0 || data.focusItems.dueThisWeek.length > 0}
        <div class="focus-panel">
          <h3>Focus</h3>
          {#if data.focusItems.overdue.length > 0}
            <div class="focus-group focus-overdue">
              <h4>Overdue</h4>
              <ul>
                {#each data.focusItems.overdue as item (item.goalId + (item.stepId ?? ''))}
                  <li>{item.label} — <span class="focus-date">{item.dueDate}</span></li>
                {/each}
              </ul>
            </div>
          {/if}
          {#if data.focusItems.dueThisWeek.length > 0}
            <div class="focus-group focus-due-soon">
              <h4>Due this week</h4>
              <ul>
                {#each data.focusItems.dueThisWeek as item (item.goalId + (item.stepId ?? ''))}
                  <li>{item.label} — <span class="focus-date">{item.dueDate}</span></li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {/if}

      {#if form?.goalError}
        <p class="error">{form.goalError}</p>
      {/if}

      {#if editingGoal}
        <GoalForm
          goal={editingGoal}
          action="?/updateGoal"
          error={form?.goalError}
          onCancel={() => (editingGoal = null)}
          onSubmitted={() => (editingGoal = null)}
        />
      {:else if creatingGoal}
        <GoalForm
          goal={null}
          action="?/createGoal"
          error={form?.goalError}
          onCancel={() => (creatingGoal = false)}
          onSubmitted={() => (creatingGoal = false)}
        />
      {:else}
        <button type="button" class="new-goal-btn" onclick={() => (creatingGoal = true)}>+ New goal</button>
      {/if}

      {#if data.goals.length === 0}
        <p class="empty-state">No goals yet.</p>
      {:else}
        <div class="goals-list">
          {#each data.goals as goal (goal.id)}
            <GoalCard
              {goal}
              isOverdue={data.focus.overdueGoalIds.has(goal.id)}
              isDueThisWeek={data.focus.dueSoonGoalIds.has(goal.id)}
              overdueStepIds={data.focus.overdueStepIds}
              dueSoonStepIds={data.focus.dueSoonStepIds}
              onEdit={(g) => (editingGoal = g)}
            />
          {/each}
        </div>
      {/if}
    </section>
  {/if}

  <section class="block">
    <h2>Reviewer</h2>

    {#if !data.reviewer}
      <form method="POST" action="?/loginReviewer" use:enhance class="login-form">
        <p class="hint-text">Shared password for reviewers.</p>
        {#if form?.reviewerError}
          <p class="error">{form.reviewerError}</p>
        {/if}
        <label>
          Password
          <input type="password" name="password" autocomplete="current-password" />
        </label>
        <button type="submit">Sign in</button>
      </form>
    {:else if !localReviewerName}
      <form class="login-form" onsubmit={saveReviewerName}>
        <p class="hint-text">What's your name? This is remembered on this device only.</p>
        <label>
          Name
          <input type="text" bind:value={reviewerNameInput} autofocus />
        </label>
        <button type="submit">Continue</button>
      </form>
    {:else}
      <p class="reviewer-identity">
        Reviewing as <strong>{localReviewerName}</strong> ·
        <button type="button" class="link-btn" onclick={forgetReviewerName}>not you?</button>
      </p>

      {#if !data.latestSelfAssessment}
        <p class="empty-state">No self-assessment has been submitted yet — nothing to review.</p>
      {:else}
        <p class="review-context">
          Reviewing her <strong>{data.latestSelfAssessment.level} — {LEVEL_META[
            data.latestSelfAssessment.level as Level
          ].title}</strong>
          self-assessment, submitted {formatDate(data.latestSelfAssessment.created_at)}.
        </p>

        {#if form?.reviewError}
          <p class="error">{form.reviewError}</p>
        {/if}

        {#if reviewLatestLevel}
          <CompetencyAssessmentForm
            competencies={COMPETENCIES}
            level={reviewLatestLevel}
            nextLevel={reviewNextLevel}
            action="?/submitReview"
            submitLabel="Submit review"
            hiddenFields={{ reviewerName: localReviewerName }}
            referenceAnswers={selfAssessmentAnswerMap}
          />
        {/if}

        {#if data.myReviews.length > 0}
          <div class="history">
            <h3>Your past reviews</h3>
            {#each data.myReviews as review (review.id)}
              <CompetencySnapshotView
                competencies={COMPETENCIES}
                title={formatDate(review.created_at)}
                answers={review.answers}
              />
            {/each}
          </div>
        {/if}

        {#if data.publicGoals.length > 0}
          <div class="history">
            <h3>Her goals</h3>
            {#each data.publicGoals as goal (goal.id)}
              <GoalCard {goal} readOnly />
            {/each}
          </div>
        {/if}
      {/if}
    {/if}
  </section>
</div>

<style>
  .container {
    max-width: min(1100px, 95vw);
    margin: 0 auto;
    padding: 0 1.5rem 4rem;
  }

  .page-header {
    padding: 3rem 0 2rem;
  }

  .page-title {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 600;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    color: var(--color-text-muted);
  }

  .block {
    padding: 2.5rem 0;
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .block h2 {
    font-size: 1.35rem;
    font-weight: 600;
  }

  .block h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-muted);
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    max-width: 320px;
  }

  .hint-text {
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  .login-form label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .login-form input {
    padding: 0.55rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    font-family: var(--font-sans);
    background: var(--color-bg);
    color: var(--color-text);
  }

  .login-form button {
    align-self: flex-start;
    padding: 0.55rem 1.25rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
  }

  .login-form button:hover {
    background: var(--color-accent-high);
  }

  .error {
    font-size: 0.875rem;
    color: #dc2626;
  }

  .empty-state {
    color: var(--color-text-muted);
  }

  .level-picker {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .level-picker select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 0.9rem;
    background: var(--color-bg);
    color: var(--color-text);
  }

  .history {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .focus-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }

  .focus-group h4 {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.4rem;
  }

  .focus-overdue h4 {
    color: #b91c1c;
  }

  .focus-due-soon h4 {
    color: #b45309;
  }

  .focus-group ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: var(--color-text);
  }

  .focus-date {
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .goals-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .new-goal-btn {
    align-self: flex-start;
    padding: 0.55rem 1.25rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
  }

  .new-goal-btn:hover {
    background: var(--color-accent-high);
  }

  .radar-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .reviewer-identity {
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  .review-context {
    font-size: 0.95rem;
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0.7rem 0.9rem;
  }

  .review-context strong {
    color: var(--color-accent-high);
  }

  .link-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--color-accent);
    font-size: 0.875rem;
    cursor: pointer;
    text-decoration: underline;
  }
</style>
