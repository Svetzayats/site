<script lang="ts">
  import { untrack } from 'svelte';
  import { enhance } from '$app/forms';
  import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
  import { renderMarkdown } from '$lib/markdown';
  import { slugify } from '$lib/slug';
  import type { ActionData, PageData } from './$types';
  import type { EditorView } from 'codemirror';
  import { resolve } from "$app/paths";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  // untrack: intentionally capturing initial server values as editable state
  let title = $state(untrack(() => data.title));
  let date = $state(untrack(() => data.date));
  let tags = $state(untrack(() => data.tags));
  let excerpt = $state(untrack(() => data.excerpt));
  let body = $state(untrack(() => data.body));
  let slug = $state(untrack(() => data.slug ?? ''));
  let slugTouched = $state(false);
  let saving = $state(false);
  let tab: 'edit' | 'preview' = $state('edit');
  let editorView: EditorView | undefined;
  let uploading = $state(false);
  let fileInput: HTMLInputElement;

$effect(() => {
    if (data.isNew && !slugTouched) {
      slug = slugify(title);
    }
  });

  const previewHtml = $derived(renderMarkdown(body));

  async function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<{ blob: Blob; filename: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Compression failed')); return; }
            const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
            resolve({ blob, filename: `${base}.webp` });
          },
          'image/webp',
          quality,
        );
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async function handleImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    uploading = true;

    try {
      const { blob, filename } = await compressImage(file);
      const fd = new FormData();
      fd.append('file', blob, filename);
      fd.append('filename', filename);

      const res = await fetch('/api/admin/images', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());

      const { path } = (await res.json()) as { path: string };
      const markdown = `![${file.name.replace(/\.[^.]+$/, '')}](${path})`;

      if (editorView) {
        const { from, to } = editorView.state.selection.main;
        editorView.dispatch({
          changes: { from, to, insert: markdown },
          selection: { anchor: from + markdown.length },
        });
        editorView.focus();
      } else {
        body += `\n\n${markdown}`;
      }
    } catch (e) {
      alert(`Upload failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      uploading = false;
      fileInput.value = '';
    }
  }
</script>

<svelte:head>
  <title>{title || 'New post'} — Admin</title>
</svelte:head>

<div class="container">
  <header class="page-header">
    <a href={resolve("/admin/blog")} class="back-link">← All posts</a>
    <h1>{data.isNew ? 'New post' : (title || data.slug)}</h1>
    {#if !data.isNew}
      <a href={resolve(`/blog/${data.slug}`)} target="_blank" class="view-link">View →</a>
    {/if}
  </header>

  <form
    method="POST"
    action="?/save"
    use:enhance={() => {
      saving = true;
      return async ({ update }) => {
        await update();
        saving = false;
      };
    }}
    class="editor-form"
  >
    <input type="hidden" name="sha" value={data.sha ?? ''} />

    <section class="section">
      <h2 class="section-title">Metadata</h2>
      <div class="fields">
        {#if data.isNew}
          <label class="field">
            <span>Slug</span>
            <input
              type="text"
              name="slug"
              bind:value={slug}
              placeholder="my-post-title"
              oninput={() => (slugTouched = true)}
              required
            />
          </label>
        {/if}
        <label class="field">
          <span>Title</span>
          <input type="text" name="title" bind:value={title} placeholder="Post title" />
        </label>
        <label class="field">
          <span>Date</span>
          <input type="date" name="date" bind:value={date} />
        </label>
        <label class="field">
          <span>Tags <small>(comma-separated)</small></span>
          <input type="text" name="tags" bind:value={tags} placeholder="web, svelte, tutorial" />
        </label>
        <label class="field field-full">
          <span>Excerpt</span>
          <input type="text" name="excerpt" bind:value={excerpt} placeholder="Short description shown in the post list" />
        </label>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Body</h2>
        <div class="section-actions">
          <input
            bind:this={fileInput}
            type="file"
            accept="image/*"
            style="display:none"
            onchange={handleImageUpload}
          />
          <button
            type="button"
            class="btn-upload"
            disabled={uploading || tab === 'preview'}
            onclick={() => fileInput.click()}
          >
            {uploading ? 'Uploading…' : 'Upload image'}
          </button>
          <div class="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'edit'}
            class="tab"
            class:active={tab === 'edit'}
            onclick={() => (tab = 'edit')}
          >Edit</button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'preview'}
            class="tab"
            class:active={tab === 'preview'}
            onclick={() => (tab = 'preview')}
          >Preview</button>
        </div>
        </div>
      </div>

      {#if tab === 'edit'}
        <MarkdownEditor bind:value={body} minHeight="500px" onready={(v) => (editorView = v)} />
      {:else}
        <div class="preview-wrap">
          {#if title}
            <h1 class="preview-title">{title}</h1>
          {/if}
          {#if previewHtml}
            <div class="prose">{@html previewHtml}</div>
          {:else}
            <p class="preview-empty">Nothing to preview yet.</p>
          {/if}
        </div>
      {/if}

      <input type="hidden" name="body" value={body} />
    </section>

    <div class="form-footer">
      {#if form?.error}
        <p class="alert alert-error">{form.error}</p>
      {/if}
      {#if form?.success}
        <p class="alert alert-success">Saved and committed to GitHub.</p>
      {/if}
      <button type="submit" class="btn-save" disabled={saving}>
        {saving ? 'Saving…' : 'Save & commit'}
      </button>
    </div>
  </form>
</div>

<style>
  .container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 1.5rem 4rem;
  }

  .page-header {
    display: flex;
    align-items: baseline;
    gap: 1.25rem;
    padding-block: 2rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 2rem;
  }

  .back-link {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .back-link:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  h1 {
    font-size: 1.375rem;
    font-weight: 600;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .view-link {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .view-link:hover {
    color: var(--color-accent);
  }

  .alert {
    padding: 0.75rem 1rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }

  .alert-error {
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fca5a5;
  }

  .alert-success {
    background: #f0fdf4;
    color: #14532d;
    border: 1px solid #86efac;
  }

  .editor-form {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.5rem;
  }

  .section-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .btn-upload {
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-upload:hover:not(:disabled) {
    color: var(--color-text);
    border-color: var(--color-accent);
  }

  .btn-upload:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .section-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
  }

  .tabs {
    display: flex;
    gap: 0.25rem;
  }

  .tab {
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tab:hover {
    color: var(--color-text);
  }

  .tab.active {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: #fff;
  }

  .preview-wrap {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 2rem;
    min-height: 500px;
  }

  .preview-title {
    font-size: 1.875rem;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.25;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .preview-empty {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .field-full {
    grid-column: 1 / -1;
  }

  .field span {
    font-weight: 500;
  }

  .field small {
    font-weight: 400;
    opacity: 0.7;
  }

  .field input {
    padding: 0.55rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    font-family: var(--font-sans);
    background: var(--color-bg);
    color: var(--color-text);
  }

  .field input:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: -1px;
  }

  .form-footer {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
  }

  .form-footer .alert {
    width: 100%;
    margin-bottom: 0;
  }

  .btn-save {
    padding: 0.6rem 1.5rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-save:hover:not(:disabled) {
    background: var(--color-accent-high);
  }

  .btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 540px) {
    .fields {
      grid-template-columns: 1fr;
    }
    .field-full {
      grid-column: 1;
    }
  }
</style>
