<script lang="ts">
  import { resolve } from "$app/paths";
  import { SvelteSet } from "svelte/reactivity";
  import CultureScale from "$lib/components/CultureScale.svelte";
  import CultureScaleFilter from "$lib/components/CultureScaleFilter.svelte";
  import { CULTURE_COUNTRIES } from "$lib/data/culture-countries";

  let visibleCodes = new SvelteSet<string>();

  function toggleCountry(code: string) {
    if (visibleCodes.has(code)) {
      visibleCodes.delete(code);
    } else {
      visibleCodes.add(code);
    }
  }

  function showAll() {
    if (visibleCodes.size === CULTURE_COUNTRIES.length) {
      visibleCodes.clear();
    } else {
      for (const country of CULTURE_COUNTRIES) {
        visibleCodes.add(country.code);
      }
    }
  }
</script>

<svelte:head>
  <title>The Culture Map — svetzayats</title>
  <meta
    name="description"
    content="Notes on The Culture Map by Erin Meyer."
  />
</svelte:head>

<div class="page">
  <a href={resolve("/")} class="back-link">
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg
    >
    Home
  </a>

  <header class="page-header">
    <span class="eyebrow">Currently reading</span>
    <h1 class="title">The Culture Map</h1>
    <p class="dek">Erin Meyer</p>
  </header>

  <div class="card-grid">
    <section class="card">
      <h2 class="card-title">About</h2>
      <ul>
        <li>First published in 2014 by PublicAffairs.</li>
        <li>Based on the author's research at INSEAD, known as the “Business School for the World,” located in Paris.</li>
        <li>Original title: “The Culture Map: Breaking Through the Invisible Boundaries of Global Business.”</li>
        <li>Later editions were retitled: “The Culture Map: Decoding How People Think, Lead, and Get Things Done Across Cultures.”</li>
      </ul>
    </section>

    <section class="card">
      <h2 class="card-title">About the author</h2>
      <ul>
          <li>Meyer was born in 1971 and raised in Minnesota.</li>
          <li>She has lived and worked in Africa, Europe, and the United States.</li>
          <li>An American living in Paris, Meyer began her career teaching English in Botswana as a Peace Corps volunteer, then later worked with Asian immigrants in the United States.</li>
          <li>She now works at INSEAD; prior to that, she was Director of Training and Development at HBOC and Director of Business Operations at McKesson Corporation.</li>
      </ul>
    </section>

    <section class="card">
      <h2 class="card-title">Main ideas</h2>
      <ul class="idea-list">
        <li><b>Fish and water</b>. The way we are conditioned to see the world in our own culture seems so completely obvious and commonplace that it is difficult to imagine that another culture might do things differently</li>
        <li>8 scales: <b>Communicating, Evaluating, Leading, Deciding, Trusting, Disagreeing, Scheduling, Persuading</b> (see below)</li>
        <li><b>Cultural relativity.</b>When examining how people from different cultures relate to one another, what matters is not the absolute position of either culture on the scale but rather the relative position of the two cultures</li>

      </ul>
    </section>

    <section class="card card-quote">
      <blockquote>
        “Placeholder quote pulled from the book — something memorable or
        thought-provoking goes here.”
      </blockquote>
    </section>
    <section class="card card-quote">
      <blockquote>
        “Placeholder quote pulled from the book — something memorable or
        thought-provoking goes here.”
      </blockquote>
    </section>
  </div>

  <section class="scales-section">
    <h2 class="section-title">Scales</h2>

    <CultureScaleFilter
      {visibleCodes}
      onToggle={toggleCountry}
      onShowAll={showAll}
    />

    <CultureScale
      title="Communicating"
      leftLabel="Low Context"
      rightLabel="High Context"
      caption="Placeholder summary — what the Communicating scale measures, in a sentence or two."
      countries={[
        { code: "US", position: 12 },
        { code: "DE", position: 22 },
        { code: "FR", position: 55 },
        { code: "BR", position: 68 },
        { code: "IN", position: 80 },
        { code: "JP", position: 94 },
      ]}
      {visibleCodes}
    />

    <CultureScale
      title="Evaluating"
      leftLabel="Direct Negative Feedback"
      rightLabel="Indirect Negative Feedback"
      caption="Placeholder summary — what the Evaluating scale measures, in a sentence or two."
      countries={[
        { code: "DE", position: 8 },
        { code: "FR", position: 28 },
        { code: "US", position: 45 },
        { code: "BR", position: 62 },
        { code: "IN", position: 75 },
        { code: "JP", position: 92 },
      ]}
      {visibleCodes}
    />
  </section>

  <div class="prose">
    <p>Notes coming soon.</p>
  </div>
</div>

<style>
  .page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 1.5rem var(--spacing-section);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin-bottom: 2.5rem;
    transition:
      gap 0.2s ease,
      color 0.15s ease;
  }
  .back-link:hover {
    gap: 0.7rem;
    color: var(--color-accent);
    text-decoration: none;
  }

  .page-header {
    margin-bottom: 2.5rem;
  }

  .eyebrow {
    display: inline-block;
    background: var(--color-gray-1);
    color: var(--color-accent-high);
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-sm);
    font-size: 0.72rem;
    font-weight: 500;
    margin-bottom: 1.25rem;
  }

  .title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(2.25rem, 4.5vw, 3.25rem);
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-bottom: 0.5rem;
  }

  .dek {
    font-size: 1.1rem;
    color: var(--color-text-muted);
  }

  /* ─── Masonry card grid ─── */
  .card-grid {
    column-count: 3;
    column-gap: 1.5rem;
    margin-bottom: var(--spacing-section);
  }

  @media (max-width: 768px) {
    .card-grid {
      column-count: 1;
    }
  }

  .card {
    break-inside: avoid;
    margin-bottom: 1.5rem;
    padding: 1.75rem;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .card-title {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.1rem;
    letter-spacing: -0.01em;
    margin-bottom: 0.85rem;
    color: var(--color-text);
  }

  .card p {
    color: var(--color-text-muted);
    line-height: 1.7;
    font-size: 0.95rem;
  }

  .idea-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .idea-list li {
    position: relative;
    padding-left: 1.1rem;
    color: var(--color-text-muted);
    line-height: 1.6;
    font-size: 0.95rem;
  }

  .idea-list li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.6em;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-accent);
  }

  .card-quote {
    background: var(--color-accent-low);
    border-color: var(--color-accent-low);
  }

  .card-quote blockquote {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 1.15rem;
    line-height: 1.5;
    color: var(--color-accent-high);
  }

  /* ─── Scales section ─── */
  .scales-section {
    margin-bottom: var(--spacing-section);
  }

  .section-title {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.5rem;
    letter-spacing: -0.01em;
    margin-bottom: 1.5rem;
  }
</style>
