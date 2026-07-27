<script lang="ts">
  import { resolve } from "$app/paths";
  import { SvelteSet, SvelteMap } from "svelte/reactivity";
  import CultureScale from "$lib/components/CultureScale.svelte";
  import CultureScaleFilter from "$lib/components/CultureScaleFilter.svelte";
  import ScaleFilter from "$lib/components/ScaleFilter.svelte";
  import GuessScale from "$lib/components/GuessScale.svelte";
  import CountryTray from "$lib/components/CountryTray.svelte";
  import ExampleCard from "$lib/components/ExampleCard.svelte";
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
    <section class="card card-about">
      <h2 class="card-title">About</h2>
      <ul class="plain-list">
        <li>First published in 2014 by PublicAffairs.</li>
        <li>Based on the author's research at INSEAD, known as the “Business School for the World,” located in Paris.</li>
        <li>Original title: “The Culture Map: Breaking Through the Invisible Boundaries of Global Business.”</li>
        <li>Later editions were retitled: “The Culture Map: Decoding How People Think, Lead, and Get Things Done Across Cultures.”</li>
      </ul>
    </section>

    <section class="card card-author">
      <h2 class="card-title">About the author</h2>
      <ul class="plain-list">
          <li>Meyer was born in 1971 and raised in Minnesota.</li>
          <li>She has lived and worked in Africa, Europe, and the United States.</li>
          <li>An American living in Paris, Meyer began her career teaching English in Botswana as a Peace Corps volunteer, then later worked with Asian immigrants in the United States.</li>
          <li>She now works at INSEAD; prior to that, she was Director of Training and Development at HBOC and Director of Business Operations at McKesson Corporation.</li>
      </ul>
    </section>

    <section class="card card-ideas">
      <h2 class="card-title">Main ideas</h2>
      <ul class="idea-list">
        <li><b>Fish and water</b>. The way we are conditioned to see the world in our own culture seems so completely obvious and commonplace that it is difficult to imagine that another culture might do things differently</li>
        <li>8 scales: <b>Communicating, Evaluating, Leading, Deciding, Trusting, Disagreeing, Scheduling, Persuading</b> (see below)</li>
        <li><b>Cultural relativity.</b>When examining how people from different cultures relate to one another, what matters is not the absolute position of either culture on the scale but rather the relative position of the two cultures</li>

      </ul>
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

  <section class="examples-section">
    <div class="scales-header">
      <h2 class="section-title">Examples and quotes</h2>
    </div>

    <div class="examples-grid">
      <ExampleCard
        tag="Example"
        title="Deaf Dulac"
        tilt="-2.5deg"
        content="An American supervisor complains that his French subordinate lacks the sophistication to grasp his meaning, while the French manager seems happily oblivious to the message her boss is trying to convey."
      />

      <ExampleCard
        tag="Recommendation"
        title=""
        tilt="0.8deg"
        content="**Most misunderstandings can be avoided by defining a clear team culture that everyone agrees to apply**"
      />

      <ExampleCard
        tag="Evaluating"
        title="French"
        tilt="1.5deg"
        content='_In a French setting, positive feedback is often given implicitly, while negative feedback is given more directly._ Same with Russians. '
      />

      <ExampleCard
        tag="Quote"
        title="Cultural & Individual"
        tilt="-1.5deg"
        content="«...you need to have an appreciation for cultural differencies as well as respect for individual differences»"
      />

      <ExampleCard
        tag="Quote"
        title="Relativity"
        tilt="3deg"
        content="«...when examining how people from different cultures relate to one another, what matters is not the absolute position of either culture on the scale but rather the relative position of the two cultures»"
      />

      <ExampleCard
        tag=""
        title="Fish & Water"
        tilt="-1.5deg"
        content="Two young fish encounter an older fish swimming the opposite way. He nods at them and says, «Morning, boys, how's the water?». On of the young fish asks after that another: «What the hell is water?»"
      />

      <ExampleCard
        tag="Recommendation"
        title=""
        tilt="2.5deg"
        content="When interacting with someone from another culture, try to watch more, listen more, and speak less"
      />

      <ExampleCard
        tag="Communicating"
        title="kuuki yomenai"
        tilt="2.5deg"
        content="kuuki yomenai means 'one who cannot read the air' — in other words, a person sorely lacking the ability to read between the lines. In Japan if you can't read the air, you are not a good listener"
      />

      <ExampleCard
        tag="Communicating"
        title=""
        tilt="-3deg"
        content="When person from high-context culture 'reads the air' during discussions, are they picking up messages that people had not intended to pass?"
      />
      <ExampleCard
        tag="Communicating"
        title="American rule"
        tilt="3deg"
        content="«Tell them what you are going to tell them, then tell them, then tell them what you've told them»"
      />
      <ExampleCard
        tag="Communicating"
        title="Languages"
        tilt="-1deg"
        content="Languages reflect the communication styles of the cultures. In some there are more words with semantic ambiguities and you have to hear the whole sentence to understand in the context and the meaning"
      />
      <ExampleCard
        tag="Communicating"
        title="second degree"
        tilt="1.5deg"
        content="Person can say one thing explicitly — first-degree message — but the statement may have an unspoken subtext which is the second-degree meaning. With shared context you can understand the real intended message"
      />
      <ExampleCard
        tag="Communicating"
        title="Why America is so low-context"
        tilt="-3deg"
        content="few hundred years of shared history, immigrants from various countries, all with different histories, different languages, and different background — little shared context. So if you want to pass a message, you had to make it as explicit and clear as possible"
      />
      <ExampleCard
        tag="Communicating"
        title="Edward Hall"
        tilt="-3deg"
        content="The american anthropologist, who originally developed the concept of low- and high-context communication in 1930s. Often used analogy of marriage: married for a long time and newlyweds"
      />
      <ExampleCard
        tag="Communicating"
        title=""
        tilt="-1deg"
        content="**If you are from a low-context culture**, you may perceive a high-context communicator as secretive, lacking transparency, or unable to communicate effectively"
      />
      <ExampleCard
        tag="Communicating"
        title=""
        tilt="-4deg"
        content="**If you are from a high-context culture**, you might perceive a low-context communicator as inappropriately stating the obvious, or even as condescending and patronizing"
      />
      <ExampleCard
        tag="Recommendation"
        title=""
        tilt="1.25deg"
        content="When you find yourself stymied or frustrated by misunderstanding, self-deprecation, laughing at yourself, and using positive worlds to describe the other culture are always good options"
      />
      <ExampleCard
        tag="Example"
        title="Writing"
        tilt="-2.25deg"
        content="Indonesian manager vs German boss. In Indonesian culture, if you have a strong relationship and come to a spoken agreement, that is enough. And recapping email is a clear sign that your partner doesn't trust you"
      />
      <ExampleCard
        tag="Example"
        title="Dutch feedback"
        tilt="1.25deg"
        content="«You're inflexible and can be socially ill-at-ease. That makes it difficult for you to communicate with your team»"
      />
      <ExampleCard
        tag=""
        title="Upgraders and downgraders"
        tilt="-2deg"
        content="Upgraders: absolutely, totally, strongly. Downgraders: kind of, sort of, a little, a bit, maybe, slightly + deliberate understatement"
      />
      <ExampleCard
        tag="Recommendation"
        title=""
        tilt="3.15deg"
        content="One rule for working with cultures that are more direct than yours on the Evaluating scale: **Don't try to do it like them**"
      />
      <ExampleCard
        wide
        tag="Evaluating"
        title="Deliberate understatement"
        tilt="1.65deg"
        content="Take the announcement made by British Airways pilot Eric Moody in 1983, after flying through a cloud of volcanic ash over Indonesia: 'Good evening again, ladies and gentlemen. This is Captain Eric Moody here. We have a small problem in that all four engines have failed. We are doing our utmost to get them going and I trust you're not in too much distress, and would the chief steward please com to the flight deck?'"
      />
      <ExampleCard
        tag="Example"
        title="Dutchman"
        tilt="-2.5deg"
        content="«When my American colleagues begin a communication with all of their 'excellents' and 'greats', it feels so exaggerated that I find it demeaning. We are adults, here to do our jobs and to do them well. We don't need our colleagues to be cheerleaders»"
      />
      <ExampleCard
        tag="Example"
        title="Great, good, okay"
        tilt="-4.5deg"
        content="For a Dutchman, the word 'excellent' is saved for a rare occasion and 'okay' is... well, neutral. But with the Americans, the grid is different. 'Excellent' is used all the time. 'Okay' seems to mean 'not okay'. 'Good' is only a mild compliment"
      />
      <ExampleCard
        tag="Recommendation"
        title="Providing evaluation"
        tilt="-2.5deg"
        content="Be explicit and low-context with both positive and negative feedback. But don't launch into the negatives until you have also explicitly stated something that you appreciate about the person or the situation"
      />
      <ExampleCard
        tag="Recommendation"
        title="Food + blur an unpleasant message"
        tilt="1.5deg"
        content="If you need to give negative feedback to a person from high-context and indirect negative feedback culture: give feedback gradually, use food and drink to blur the message, **say the good and leave out the bad**"
      />
      <ExampleCard
        tag="Example"
        wide
        title="leave out the bad"
        tilt="-0.5deg"
        content="«A while back, one of my Indonesian colleagues sent me a set of four documents to read and review. The last two documents he must have finished in a hurry ... they were very sloppy in compariosn to the first two. ... I told him that the first two papers where excellent. I focused on these documents only, outlining why they were so effective. I didn't need to mention the sloppy documents, which would have been uncomfortable for both of us»"
      />
      <ExampleCard
          wide
        tag="Persuading"
        title=""
        tilt="1.5deg"
        content="«One of the most common frustrations among **French employees with American bosses** is that the American tells them what to do without explaining why they need to do it. From the French perspective, this can feel demotivating, even disrespectful. By contrast, American bosses may feel that French workers are uncooperative because, instead of acting quickly, they always ask 'Why?' and are not ready to act until they have received a suitable response»"
      />
      <ExampleCard
        tag="Recommendation"
        title=""
        tilt="0deg"
        content="Presenting to Londoners or New Yorkers? Get to the point and stick to it. Presenting to French, Spaniards, or Germans? Spend more time setting the parameters and explaining the background"
        />
      <ExampleCard
        tag="Example"
        title="Asian holistic approach"
        tilt="-2.5deg"
        content="Making photo of a person — a lot of background. Noticing details and whole picture. Think from macro to micro: address, date"
      />
      <ExampleCard
        tag="Example"
        title="Danes and egalitarian principles"
        tilt="0.8deg"
        content="Do not think you are better than others. Do not think you are smarter than others. Do not think you are more important than others. Do not think you are someone special"
      />

      <ExampleCard
        tag="Decisioning"
        title=""
        tilt="2.8deg"
        content="Being successful as the pioneers spread west across the American plains depend on arriving first and working hard, regarding mistakes as an inevitable and ultimately insignificant side effect of speed. As a corollary, Americans developed a dislike for too much discussion, which would just slow them down, preferring to make decisions quickly, often based on scanty information, whether by the leader or by voting."
      />

      <ExampleCard
        tag="Example"
        title="Australian boss in China"
        tilt="-2.8deg"
        content="«Well, I love my bike, but I was in China to get my team motivated and on track. ... I gave up the bike and started taking public transportation, just like every other Chinese boss»"
      />

      <ExampleCard
        tag="Recommendation"
        title="How to get feedback if you are a boss"
        tilt="0.5deg"
        content="Removing the boss from the meeting (brainstorm group), give questions that you want to ask ahead of meeting, invite people to speak up"
      />

      <ExampleCard
        tag="Example"
        title=""
        tilt="3.2deg"
        content="«And if you are German, and you dare to challenge your American boss, as is so common in Germany, don't be surprised if you find yourself one step closer to unemployment. I know it's true — it happened to me!»"
      />
      <ExampleCard
        tag=""
        title="ringisho"
        tilt="-1deg"
        content="The japanese ring system: hierarchical but ultra-consensual"
      />

      <ExampleCard
        tag="Trusting"
        title=""
        tilt="2.3deg"
        content="**cognitive trust and affective trust**"
      />

      <ExampleCard
        tag="Trusting"
        title=""
        tilt="-1.3deg"
        content="The United States has a long tradition of separating the practical and emotional. Mixing the two is perceived as unprofessional and risks conflict of interest"
      />

      <ExampleCard
        tag="Trusting"
        title=""
        tilt="2.3deg"
        content="icebreaker exercises in relationship-based societies are rare. Relationships are built up slowly"
      />

      <ExampleCard
        tag="Recommendation"
        title=""
        tilt="-0.3deg"
        content="when you work internationally, no matter who you are working with, investing more time in building affective trust is a good idea"
      />

      <ExampleCard
        tag="Trusting"
        title=""
        tilt="0deg"
        content="why invest in relationships? because in many cultures, the relationship is your contract (instead of ineffective or complex legal system)"
      />

      <ExampleCard
        tag="Disagreement"
        title="China"
        tilt="1.7deg"
        content="In China, protecting another person's face is more important than stating what you believe is correct"
      />
      <ExampleCard
        tag="Disagreement"
        title="French"
        tilt="-1.7deg"
        content="We make our points passionately. We like to disagree openly. We like to say things that shock. With confrontation, you reach excellence, you have more creativity, and you eliminate risk"
      />

      <ExampleCard
        tag="Disagreement"
        title=""
        tilt="2.3deg"
        content="If someone in my culture disagrees strongly with my idea, does that suggest they are disapproving of me or just of the idea?
        In more confrontational cultures, it seems quite natural to attack someone's opinion without attacking that person."
      />
    </div>
  </section>



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

  /* ─── Card grid ─── */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(280px, 1fr));
    grid-template-areas:
      "about author"
      "ideas ideas";
    align-items: stretch;
    gap: 1.5rem;
    margin-bottom: var(--spacing-section);
  }

  .card-about {
    grid-area: about;
  }

  .card-author {
    grid-area: author;
  }

  .card-ideas {
    grid-area: ideas;
    justify-self: start;
    width: 90%;
  }

  @media (max-width: 768px) {
    .card-grid {
      grid-template-columns: 1fr;
      grid-template-areas:
        "about"
        "author"
        "ideas";
    }

    .card-ideas {
      width: 100%;
    }
  }

  .card {
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

  .plain-list {
    padding-left: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .plain-list li {
    color: var(--color-text-muted);
    line-height: 1.6;
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

  /* ─── Examples section ─── */
  .examples-section {
    margin-bottom: var(--spacing-section);
  }

  .examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 2.5rem 1.75rem;
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
