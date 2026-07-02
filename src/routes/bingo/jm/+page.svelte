<script lang="ts">
  import { enhance } from '$app/forms';
  import { browser } from '$app/environment';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let authenticated = $derived(data.authenticated || form?.authenticated === true);

  const STORAGE_KEY = 'bingo_jm_state';

  function loadState(): Set<string> {
    if (!browser) return new Set();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  function saveState(marked: Set<string>) {
    if (!browser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...marked]));
  }

  let marked = $state<Set<string>>(new Set());
  let addText = $state('');

  $effect(() => {
    if (authenticated) {
      marked = loadState();
    }
  });

  function toggle(id: string) {
    const next = new Set(marked);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    marked = next;
    saveState(next);
  }

  function reset() {
    marked = new Set();
    if (browser) localStorage.removeItem(STORAGE_KEY);
  }
</script>

{#if authenticated}
  <div class="page">
    <div class="header">
      <h1>Bingo</h1>
      <button class="reset-btn" onclick={reset}>Reset</button>
    </div>
    <div class="grid">
      {#each data.cards as card (card.id)}
        <button
          class="card"
          class:marked={marked.has(card.id)}
          onclick={() => toggle(card.id)}
        >
          <span class="card-text">{card.text}</span>
          {#if marked.has(card.id)}
            <span class="check" aria-hidden="true">✓</span>
          {/if}
        </button>
      {/each}
    </div>
    <form
      method="POST"
      action="?/addCard"
      class="add-form"
      use:enhance={() => {
        return ({ update }) => {
          addText = '';
          update();
        };
      }}
    >
      <input
        type="text"
        name="text"
        bind:value={addText}
        placeholder="New card text…"
        required
      />
      <button type="submit">Add</button>
    </form>
  </div>
{:else}
  <div class="wrap">
    <form method="POST" action="?/login" use:enhance class="login-form">
      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}
      <label>
        Password
        <input type="password" name="password" autofocus />
      </label>
      <button type="submit">Enter</button>
    </form>
  </div>
{/if}

<style>
  /* ── Auth form ── */
  .wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 320px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  input {
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    font-family: var(--font-sans);
    background: var(--color-bg);
    color: var(--color-text);
  }

  input:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: -1px;
  }

  .login-form button {
    padding: 0.6rem 1rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
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

  /* ── Bingo board ── */
  .page {
    max-width: 760px;
    margin: 0 auto;
    padding: 2rem 1rem 4rem;
  }

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 1.75rem;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  .reset-btn {
    padding: 0.4rem 0.9rem;
    font-size: 0.8rem;
    font-family: var(--font-sans);
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }

  .reset-btn:hover {
    color: var(--color-text);
    border-color: var(--color-text-muted);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  .card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100px;
    padding: 1rem;
    background: var(--color-bg);
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
    user-select: none;
  }

  .card:hover {
    border-color: var(--color-accent);
  }

  .card.marked {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: #fff;
  }

  .card-text {
    line-height: 1.3;
  }

  .check {
    position: absolute;
    top: 0.4rem;
    right: 0.55rem;
    font-size: 0.75rem;
    opacity: 0.85;
  }

  /* ── Add card form ── */
  .add-form {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .add-form input {
    flex: 1;
    min-width: 0;
  }

  .add-form button {
    padding: 0.6rem 1rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }

  .add-form button:hover {
    background: var(--color-accent-high);
  }
</style>
