<script lang="ts">
  const sections = [
    {
      href: "/blog",
      emoji: "✍️",
      title: "Blog",
      description:
        "Notes on frontend development, things I learn, and occasional non-tech thoughts.",
    },
    // {
    // 	href: '/pensieve',
    // 	emoji: '🗂️',
    // 	title: 'Pensieve',
    // 	description: 'A collection of canvas boards — visual spaces for exploring different topics.',
    // },
    // {
    // 	href: '/quotes',
    // 	emoji: '💬',
    // 	title: 'Quotes',
    // 	description: 'Lines from books, people, and the internet that stuck with me.',
    // },
  ];

  const interests = [
    "Anime, sci-fi, and fantasy books",
    "Improving well-being and happiness",
    "Sporadic running",
    "Thoughtless cross-stitching",
    "Contemplative walking",
    "Having fun with software development",
  ];

  const startDevelopment = 2018;
  const currentYear = new Date().getFullYear();
  const yearsOfExperience = $derived(currentYear - startDevelopment);
</script>

<svelte:head>
  <title>Svetlana Zaiats</title>
</svelte:head>

<!-- ── Hero ────────────────────────────────────────────── -->
<section class="hero">
  <div class="container">
    <p class="hero-eyebrow">Hi, I'm</p>
    <h1 class="hero-name">
      Svetlana Zaiats <span class="muted">/ svetzayats</span>
    </h1>
    <p class="hero-tagline">
      I like learning stuff and working on my happiness.
    </p>
    <p class="hero-sub">
      Proud owner of a beautiful calico and full-stack engineer with {yearsOfExperience}+
      years of experience, based in Raleigh, NC. I enjoy reading fiction and
      non-fiction, walking on trails with my husband, observing animals, and
      talking about bizarre things — like should we care if we live in a
      simulation.
    </p>
    <div class="contacts">
      <div class="hero-links">
        <a
          href="https://github.com/Svetzayats"
          target="_blank"
          rel="noopener"
          class="btn-primary"
          id="github-btn"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/svetlana-zayats/"
          target="_blank"
          rel="noopener"
          class="btn-ghost"
        >
          LinkedIn
        </a>
      </div>
      <span id="github-tip" class="btn-tip">
        My github, nothing really cool there</span
      >
    </div>
  </div>
</section>

<!-- ── About ───────────────────────────────────────────── -->
<section class="about">
  <div class="container">
    <h2 class="section-title">About me</h2>
    <div class="about-grid">
      <div class="about-text">
        <p>
          Professionally, I'm a full-stack engineer and JS mentor. I've been
          writing code since
          {startDevelopment} and still find it genuinely interesting — there's always
          something new to figure out. My strengths: getting things done, writing
          maintainable code, and caring about the user experience.
        </p>
        <p>
          I read a lot (it doesn't mean that I'm an intellectual), sometimes
          play table tennis, and find inspiration in anime and everywhere I can.
          My cat Trisha carefully supervises all of it and lives her best life,
          trying to teach me to do the same.
        </p>
        <p>
          Originally, I'm from the Urals (Russia), but I previously spent three
          years living in Tbilisi, Georgia. Now I'm in Raleigh, North Carolina,
          enjoying the sun and closeness to nature.
        </p>
      </div>

      <div class="interests-card">
        <h3 class="card-label">Currently into</h3>
        <ul class="interests-list">
          {#each interests as item}
            <li>{item}</li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ── Sections nav ────────────────────────────────────── -->
<section class="sections-nav">
  <div class="container">
    <h2 class="section-title">What's here</h2>
    <div class="cards-grid">
      {#each sections as { href, emoji, title, description }}
        <a {href} class="section-card">
          <span class="card-emoji">{emoji}</span>
          <h3 class="card-title">{title}</h3>
          <p class="card-desc">{description}</p>
          <span class="card-arrow">→</span>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  /* ── Shared ────────────────────────────────────── */
  .container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .section-title {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-accent);
    margin-bottom: 1.75rem;
  }

  /* ── Hero ──────────────────────────────────────── */
  .hero {
    padding: 5rem 0 4rem;
    border-bottom: 1px solid var(--color-border);
  }

  .hero-eyebrow {
    font-size: 1rem;
    color: var(--color-text-muted);
    margin-bottom: 0.35rem;
  }

  .hero-name {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin-bottom: 1rem;
  }

  .muted {
    color: var(--color-gray-3);
    font-weight: 400;
  }

  .hero-tagline {
    font-size: 1.25rem;
    color: var(--color-accent);
    font-weight: 500;
    margin-bottom: 1rem;
  }

  .hero-sub {
    font-size: 1.05rem;
    color: var(--color-text-muted);
    max-width: 520px;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .hero-links {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: flex-end;
  }

  .btn-tip-wrap {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }

  .contacts:has(#github-btn:hover) #github-tip {
    opacity: 0.55;
    transform: translateY(0);
  }

  .btn-tip {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    opacity: 0;
    transform: translateY(-4px);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
    pointer-events: none;
    white-space: nowrap;
  }

  .btn-tip-wrap:hover .btn-tip {
    opacity: 0.55;
    transform: translateY(0);
  }

  .btn-primary {
    display: inline-block;
    background: var(--color-accent);
    color: #fff;
    padding: 0.6rem 1.4rem;
    border-radius: var(--radius-sm);
    font-weight: 500;
    font-size: 0.925rem;
    transition: background 0.15s ease;
  }

  .btn-primary:hover {
    background: var(--color-accent-high);
    text-decoration: none;
  }

  .btn-ghost {
    display: inline-block;
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    padding: 0.6rem 1.4rem;
    border-radius: var(--radius-sm);
    font-weight: 500;
    font-size: 0.925rem;
    transition:
      border-color 0.15s ease,
      color 0.15s ease;
  }

  .btn-ghost:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
    text-decoration: none;
  }

  /* ── About ─────────────────────────────────────── */
  .about {
    padding: var(--spacing-section) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .about-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: start;
  }

  .about-text {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    font-size: 1rem;
    color: var(--color-text);
    line-height: 1.75;
  }

  .interests-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1.5rem;
  }

  .card-label {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent);
    margin-bottom: 1rem;
  }

  .interests-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .interests-list li {
    font-size: 0.925rem;
    color: var(--color-text-muted);
    padding-left: 1rem;
    position: relative;
  }

  .interests-list li::before {
    content: "·";
    position: absolute;
    left: 0;
    color: var(--color-accent);
    font-weight: 700;
  }

  /* ── Sections nav ──────────────────────────────── */
  .sections-nav {
    padding: var(--spacing-section) 0;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .section-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    color: var(--color-text);
    position: relative;
  }

  .section-card:hover {
    border-color: var(--color-accent);
    box-shadow: 0 4px 16px rgba(167, 0, 195, 0.08);
    text-decoration: none;
  }

  .card-emoji {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }

  .card-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .card-desc {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.55;
    flex: 1;
  }

  .card-arrow {
    font-size: 1rem;
    color: var(--color-accent);
    margin-top: 0.5rem;
    transition: transform 0.15s ease;
  }

  .section-card:hover .card-arrow {
    transform: translateX(4px);
  }

  /* ── Responsive ────────────────────────────────── */
  @media (max-width: 640px) {
    .cards-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
