<script lang="ts">
  import { resolve } from "$app/paths";
  import { SvelteSet, SvelteMap } from "svelte/reactivity";
  import CultureScale from "$lib/components/CultureScale.svelte";
  import CultureScaleFilter from "$lib/components/CultureScaleFilter.svelte";
  import ScaleFilter from "$lib/components/ScaleFilter.svelte";
  import GuessScale from "$lib/components/GuessScale.svelte";
  import CountryTray from "$lib/components/CountryTray.svelte";
  import { CULTURE_COUNTRIES, getCultureCountry } from "$lib/data/culture-countries";
  import { dragState, startDrag } from "$lib/drag.svelte";

  interface ScalePosition {
    code: string;
    position: number;
  }

  interface ScaleDef {
    title: string;
    leftLabel: string;
    rightLabel: string;
    caption: string;
    countries: ScalePosition[];
  }

  const SCALES: ScaleDef[] = [
    {
      title: "Communicating",
      leftLabel: "Low-Context",
      rightLabel: "High-Context",
      caption:
        "Low-context: good communication is precise, simple, and clear — messages are taken at face value. High-context: good communication is nuanced and layered — messages are often implied rather than plainly expressed.",
      countries: [
        { code: "US", position: 8 },
        { code: "AU", position: 12 },
        { code: "CA", position: 14 },
        { code: "NL", position: 19 },
        { code: "DE", position: 24 },
        { code: "DK", position: 32 },
        { code: "UK", position: 34 },
        { code: "FI", position: 36 },
        { code: "PL", position: 43 },
        { code: "BR", position: 50 },
        { code: "AR", position: 54 },
        { code: "ES", position: 55 },
        { code: "MX", position: 58 },
        { code: "IT", position: 61 },
        { code: "PE", position: 62 },
        { code: "FR", position: 66 },
        { code: "RU", position: 69 },
        { code: "SG", position: 70 },
        { code: "IN", position: 76 },
        { code: "IR", position: 78 },
        { code: "SA", position: 80 },
        { code: "KE", position: 83 },
        { code: "CN", position: 86 },
        { code: "KR", position: 89 },
        { code: "ID", position: 91 },
        { code: "JP", position: 93 },
      ],
    },
    {
      title: "Evaluating",
      leftLabel: "Direct Negative Feedback",
      rightLabel: "Indirect Negative Feedback",
      caption:
        "Direct: criticism is frank and blunt, not softened by positive comments, and may be given to an individual in front of a group. Indirect: criticism is soft, diplomatic, wrapped in positive messages, and given only in private.",
      countries: [
        { code: "IL", position: 8 },
        { code: "RU", position: 10 },
        { code: "NL", position: 12 },
        { code: "DE", position: 17 },
        { code: "FR", position: 24 },
        { code: "DK", position: 25 },
        { code: "NO", position: 27 },
        { code: "ES", position: 36 },
        { code: "IT", position: 38 },
        { code: "AU", position: 39 },
        { code: "US", position: 50 },
        { code: "CA", position: 53 },
        { code: "UK", position: 54 },
        { code: "AR", position: 58 },
        { code: "BR", position: 62 },
        { code: "MX", position: 65 },
        { code: "IN", position: 71 },
        { code: "KE", position: 72 },
        { code: "CN", position: 76 },
        { code: "GH", position: 79 },
        { code: "KR", position: 82 },
        { code: "SA", position: 83 },
        { code: "ID", position: 92 },
        { code: "TH", position: 94 },
        { code: "JP", position: 95 },
      ],
    },
    {
      title: "Persuading",
      leftLabel: "Principles-first",
      rightLabel: "Applications-first",
      caption:
        "Applications-first: arguments open with a fact, statement, or executive summary, then add supporting concepts as needed — practical and concrete, avoiding theory in business settings. Principles-first: arguments build the theory or concept first, then move to a conclusion — the underlying logic is what matters.",
      countries: [
        { code: "IT", position: 10 },
        { code: "FR", position: 11 },
        { code: "ES", position: 18 },
        { code: "RU", position: 20 },
        { code: "DE", position: 32 },
        { code: "BR", position: 40 },
        { code: "AR", position: 45 },
        { code: "MX", position: 51 },
        { code: "SE", position: 56 },
        { code: "DK", position: 60 },
        { code: "NL", position: 64 },
        { code: "UK", position: 71 },
        { code: "AU", position: 82 },
        { code: "CA", position: 84 },
        { code: "US", position: 92 },
      ],
    },
    {
      title: "Leading",
      leftLabel: "Egalitarian",
      rightLabel: "Hierarchical",
      caption:
        "Egalitarian: the ideal distance between boss and subordinate is low — the best boss is a facilitator among equals, structures are flat, and communication often skips hierarchical lines. Hierarchical: the ideal distance is high — the best boss is a strong director who leads from the front, status matters, and communication follows set hierarchical lines.",
      countries: [
        { code: "SE", position: 7 },
        { code: "DK", position: 9 },
        { code: "NL", position: 11 },
        { code: "IL", position: 18 },
        { code: "AU", position: 20 },
        { code: "CA", position: 30 },
        { code: "FI", position: 32 },
        { code: "US", position: 39 },
        { code: "UK", position: 44 },
        { code: "DE", position: 53 },
        { code: "BR", position: 55 },
        { code: "ES", position: 62 },
        { code: "FR", position: 63 },
        { code: "IT", position: 65 },
        { code: "MX", position: 72 },
        { code: "PL", position: 73 },
        { code: "RU", position: 77 },
        { code: "PE", position: 78 },
        { code: "SA", position: 83 },
        { code: "IN", position: 85 },
        { code: "CN", position: 86 },
        { code: "KR", position: 92 },
        { code: "JP", position: 94 },
        { code: "NG", position: 96 },
      ],
    },
    {
      title: "Deciding",
      leftLabel: "Consensual",
      rightLabel: "Top-down",
      caption:
        "Consensual: decisions are made in groups through unanimous agreement. Top-down: decisions are made by individuals, usually the boss.",
      countries: [
        { code: "JP", position: 6 },
        { code: "SE", position: 12 },
        { code: "NL", position: 20 },
        { code: "DE", position: 34 },
        { code: "UK", position: 46 },
        { code: "US", position: 56 },
        { code: "BR", position: 61 },
        { code: "FR", position: 65 },
        { code: "IT", position: 69 },
        { code: "RU", position: 80 },
        { code: "IN", position: 84 },
        { code: "CN", position: 88 },
        { code: "NG", position: 94 },
      ],
    },
    {
      title: "Trusting",
      leftLabel: "Task-based",
      rightLabel: "Relationship-based",
      caption:
        "Task-based: trust is built through business-related activities — work relationships form and end easily based on practicality; doing good, reliable work is enough. Relationship-based: trust is built through sharing meals, time, and personal connection — relationships build slowly, and trust follows from truly knowing someone.",
      countries: [
        { code: "US", position: 5 },
        { code: "NL", position: 12 },
        { code: "DK", position: 13 },
        { code: "AU", position: 20 },
        { code: "DE", position: 23 },
        { code: "FI", position: 27 },
        { code: "UK", position: 34 },
        { code: "AT", position: 43 },
        { code: "PL", position: 45 },
        { code: "FR", position: 56 },
        { code: "ES", position: 61 },
        { code: "IT", position: 65 },
        { code: "JP", position: 71 },
        { code: "RU", position: 73 },
        { code: "MX", position: 75 },
        { code: "TR", position: 78 },
        { code: "TH", position: 81 },
        { code: "BR", position: 83 },
        { code: "CN", position: 87 },
        { code: "IN", position: 89 },
        { code: "SA", position: 92 },
        { code: "NG", position: 94 },
      ],
    },
    {
      title: "Disagreeing",
      leftLabel: "Confrontational",
      rightLabel: "Avoids Confrontation",
      caption:
        "Confrontational: disagreement and debate are seen as positive for the team — open confrontation won't harm the relationship. Avoids confrontation: disagreement and debate are seen as negative for the team — open confrontation would break group harmony or damage the relationship.",
      countries: [
        { code: "IL", position: 8 },
        { code: "FR", position: 12 },
        { code: "DE", position: 17 },
        { code: "RU", position: 19 },
        { code: "NL", position: 21 },
        { code: "ES", position: 27 },
        { code: "DK", position: 28 },
        { code: "IT", position: 34 },
        { code: "AU", position: 38 },
        { code: "US", position: 47 },
        { code: "UK", position: 49 },
        { code: "BR", position: 57 },
        { code: "SG", position: 61 },
        { code: "SE", position: 63 },
        { code: "MX", position: 65 },
        { code: "IN", position: 70 },
        { code: "SA", position: 72 },
        { code: "PE", position: 73 },
        { code: "CN", position: 77 },
        { code: "GH", position: 81 },
        { code: "TH", position: 88 },
        { code: "ID", position: 90 },
        { code: "JP", position: 92 },
      ],
    },
    {
      title: "Scheduling",
      leftLabel: "Linear-time",
      rightLabel: "Flexible-time",
      caption:
        "Linear-time: project steps happen sequentially, one task at a time, with no interruptions — the focus is on the deadline and sticking to the schedule. Flexible-time: project steps happen fluidly, with many things handled at once and interruptions accepted — the focus is on adaptability over organization.",
      countries: [
        { code: "DE", position: 7 },
        { code: "CH", position: 8 },
        { code: "JP", position: 16 },
        { code: "SE", position: 19 },
        { code: "US", position: 25 },
        { code: "DK", position: 26 },
        { code: "NL", position: 27 },
        { code: "UK", position: 31 },
        { code: "CZ", position: 41 },
        { code: "PL", position: 43 },
        { code: "FR", position: 55 },
        { code: "ES", position: 61 },
        { code: "IT", position: 64 },
        { code: "RU", position: 66 },
        { code: "MX", position: 72 },
        { code: "TR", position: 76 },
        { code: "BR", position: 78 },
        { code: "CN", position: 83 },
        { code: "IN", position: 90 },
        { code: "KE", position: 92 },
        { code: "SA", position: 94 },
        { code: "NG", position: 96 },
      ],
    },
  ];

  const SCALE_TITLES = SCALES.map((s) => s.title);

  let visibleCodes = new SvelteSet<string>();
  let visibleScales = new SvelteSet<string>(SCALE_TITLES);

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

  function toggleScale(scale: string) {
    if (visibleScales.has(scale)) {
      visibleScales.delete(scale);
    } else {
      visibleScales.add(scale);
    }
  }

  function showAllScales() {
    if (visibleScales.size === SCALE_TITLES.length) {
      visibleScales.clear();
    } else {
      for (const scale of SCALE_TITLES) {
        visibleScales.add(scale);
      }
    }
  }

  // ─── Guess mode ─────────────────────────────────────────
  let guessMode = $state(false);
  let guesses = new SvelteMap<string, number>(); // key: `${scaleTitle}:${code}`
  let revealedScales = new SvelteSet<string>();
  let armedCode = $state<string | null>(null);

  function guessKey(scale: string, code: string) {
    return `${scale}:${code}`;
  }

  function commitGuess(scale: string, code: string, position: number) {
    guesses.set(guessKey(scale, code), position);
  }

  function uncommitGuess(scale: string, code: string) {
    guesses.delete(guessKey(scale, code));
  }

  function guessesForScale(scale: string): Map<string, number> {
    const prefix = `${scale}:`;
    const result = new SvelteMap<string, number>();
    for (const [key, position] of guesses) {
      if (key.startsWith(prefix)) {
        result.set(key.slice(prefix.length), position);
      }
    }
    return result;
  }

  function beginDrag(code: string, sourceScale: string | null, e: PointerEvent) {
    armedCode = null;
    startDrag(code, sourceScale, e, commitGuess, uncommitGuess);
  }

  function armCountry(code: string) {
    armedCode = armedCode === code ? null : code;
  }

  function placeArmed(scale: string, e: MouseEvent) {
    if (!armedCode) return;
    const track = e.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    const position = Math.min(
      100,
      Math.max(0, ((e.clientX - rect.left) / rect.width) * 100),
    );
    commitGuess(scale, armedCode, position);
    armedCode = null;
  }

  function toggleReveal(scale: string) {
    if (revealedScales.has(scale)) {
      revealedScales.delete(scale);
    } else {
      revealedScales.add(scale);
    }
  }

  function resetScale(scale: string) {
    const prefix = `${scale}:`;
    for (const key of [...guesses.keys()]) {
      if (key.startsWith(prefix)) {
        guesses.delete(key);
      }
    }
    revealedScales.delete(scale);
  }

  function toggleGuessMode() {
    guessMode = !guessMode;
    armedCode = null;
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
    <div class="scales-header">
      <h2 class="section-title">Scales</h2>
      <button type="button" class="mode-toggle" onclick={toggleGuessMode}>
        {guessMode ? "← Back to scales" : "Try guessing"}
      </button>
    </div>

    <ScaleFilter
      scales={SCALE_TITLES}
      {visibleScales}
      onToggle={toggleScale}
      onShowAll={showAllScales}
    />

    {#if guessMode}
      <CountryTray
        {armedCode}
        onPointerDown={(code, e) => beginDrag(code, null, e)}
        onArm={armCountry}
      />
    {:else}
      <CultureScaleFilter
        {visibleCodes}
        onToggle={toggleCountry}
        onShowAll={showAll}
      />
    {/if}

    {#each SCALES as scaleDef (scaleDef.title)}
      {#if visibleScales.has(scaleDef.title)}
        {#if guessMode}
          <GuessScale
            title={scaleDef.title}
            leftLabel={scaleDef.leftLabel}
            rightLabel={scaleDef.rightLabel}
            caption={scaleDef.caption}
            countries={scaleDef.countries}
            guesses={guessesForScale(scaleDef.title)}
            revealed={revealedScales.has(scaleDef.title)}
            {armedCode}
            onPointerDown={(code, e) => beginDrag(code, scaleDef.title, e)}
            onArm={armCountry}
            onTrackClick={(e) => placeArmed(scaleDef.title, e)}
            onToggleReveal={() => toggleReveal(scaleDef.title)}
            onReset={() => resetScale(scaleDef.title)}
          />
        {:else}
          <CultureScale
            title={scaleDef.title}
            leftLabel={scaleDef.leftLabel}
            rightLabel={scaleDef.rightLabel}
            caption={scaleDef.caption}
            countries={scaleDef.countries}
            {visibleCodes}
          />
        {/if}
      {/if}
    {/each}
  </section>

  <div class="prose">
    <p>Notes coming soon.</p>
  </div>

  {#if dragState.current}
    {@const ghostInfo = getCultureCountry(dragState.current.code)}
    {#if ghostInfo}
      <div
        class="drag-ghost"
        style="left: {dragState.current.x}px; top: {dragState.current.y}px; background: {ghostInfo.color};"
      >
        {ghostInfo.code}
      </div>
    {/if}
  {/if}
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

  .scales-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.5rem;
    letter-spacing: -0.01em;
  }

  .mode-toggle {
    padding: 0.45rem 1rem;
    border: 1px solid var(--color-accent);
    border-radius: var(--radius-lg);
    background: var(--color-accent-low);
    color: var(--color-accent-high);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .mode-toggle:hover {
    background: var(--color-accent);
    color: #fff;
  }

  /* ─── Drag ghost ─── */
  .drag-ghost {
    position: fixed;
    z-index: 1000;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    border: 2px solid var(--color-bg);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 600;
    pointer-events: none;
  }
</style>
