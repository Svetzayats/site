<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { markdown } from '@codemirror/lang-markdown';

  interface Props {
    value: string;
    onchange?: (value: string) => void;
    onready?: (view: EditorView) => void;
    minHeight?: string;
  }

  let { value = $bindable(), onchange, onready, minHeight = '300px' }: Props = $props();

  let container: HTMLDivElement;
  let view: EditorView;

  onMount(() => {
    view = new EditorView({
      doc: value,
      extensions: [
        basicSetup,
        markdown(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            value = newValue;
            onchange?.(newValue);
          }
        }),
        EditorView.theme({
          '&': { fontSize: '0.9rem', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" },
          '.cm-content': { padding: '1rem', minHeight },
          '.cm-gutters': { backgroundColor: '#f5f0fa', borderRight: '1px solid #d9cce8', color: '#9581ae' },
          '.cm-activeLineGutter': { backgroundColor: '#ebc9f3' },
          '.cm-activeLine': { backgroundColor: '#faf7fd' },
          '.cm-focused': { outline: 'none' },
        }),
      ],
      parent: container,
    });
    onready?.(view);
  });

  onDestroy(() => {
    view?.destroy();
  });

  $effect(() => {
    if (view && view.state.doc.toString() !== value) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    }
  });
</script>

<div bind:this={container} class="editor-wrap"></div>

<style>
  .editor-wrap {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .editor-wrap :global(.cm-editor) {
    width: 100%;
  }

  .editor-wrap :global(.cm-scroller) {
    overflow: auto;
  }
</style>
