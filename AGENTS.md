# AGENTS.md

## SvelteKit internal links

Always use `resolve()` from `$app/paths` for `href` values that point to
internal routes — never a raw string literal.

```svelte
<script lang="ts">
  import { resolve } from "$app/paths";
</script>

<a href={resolve("/blog")}>Blog</a>
<a href={resolve(`/blog/${slug}`)}>Post</a>
```

Raw internal hrefs (e.g. `href="/"`, `href="/blog"`) trip the
`svelte/no-navigation-without-resolve` eslint rule and fail `pnpm lint`.
This does not apply to external URLs (`https://...`), `mailto:`, or
same-page fragment links (`#section`), which should stay as plain string
hrefs.
