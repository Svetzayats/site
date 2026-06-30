<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let authenticated = $derived(data.authenticated || form?.authenticated === true);
</script>

{#if authenticated}
  <!-- content goes here -->
{:else}
  <div class="wrap">
    <form method="POST" use:enhance class="login-form">
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

  button {
    padding: 0.6rem 1rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
  }

  button:hover {
    background: var(--color-accent-high);
  }

  .error {
    font-size: 0.875rem;
    color: #dc2626;
  }
</style>
