<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import "../app.css";

  let { children } = $props();

  const nav = [
    { href: "/blog", label: "Blog" },
    // { href: '/pensieve', label: 'Pensieve' },
    { href: '/quotes',   label: 'Quotes'   },
  ];
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<header class="site-header">
  <div class="header-inner">
    <a href="/" class="wordmark">🐰 svetzayats</a>

    <nav class="site-nav" aria-label="Main navigation">
      {#each nav as { href, label }}
        <a {href} class="nav-link">{label}</a>
      {/each}
    </nav>
  </div>
</header>

<main class="site-main">
  {@render children()}
</main>

<footer class="site-footer">
  <div class="footer-inner">
    <span class="footer-copy">© {new Date().getFullYear()} Svetlana Zaiats</span
    >
    <div class="footer-links">
      <a href="https://github.com/Svetzayats" target="_blank" rel="noopener"
        >GitHub</a
      >
      <a
        href="https://linkedin.com/in/svetlana-zayats/"
        target="_blank"
        rel="noopener">LinkedIn</a
      >
      <a href="https://t.me/SvZayats" target="_blank" rel="noopener">Telegram</a
      >
    </div>
  </div>
</footer>

<style>
  /* ── Header ───────────────────────────────────── */
  .site-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--color-border);
  }

  .header-inner {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .wordmark {
    font-weight: 600;
    font-size: 1rem;
    color: var(--color-text);
    letter-spacing: -0.01em;
  }

  .wordmark:hover {
    text-decoration: none;
    color: var(--color-accent);
  }

  .site-nav {
    display: flex;
    gap: 2rem;
  }

  .nav-link {
    font-size: 0.925rem;
    font-weight: 500;
    color: var(--color-text-muted);
    transition: color 0.15s ease;
  }

  .nav-link:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  /* ── Main ─────────────────────────────────────── */
  .site-main {
    flex: 1;
    width: 100%;
  }

  /* ── Footer ───────────────────────────────────── */
  .site-footer {
    border-top: 1px solid var(--color-border);
    margin-top: var(--spacing-section);
  }

  .footer-inner {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .footer-copy {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .footer-links {
    display: flex;
    gap: 1.5rem;
  }

  .footer-links a {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .footer-links a:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  @media (max-width: 500px) {
    .footer-inner {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
