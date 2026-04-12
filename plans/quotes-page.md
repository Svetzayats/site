# Plan: Quotes Page

> Source PRD: `docs/PRD-quotes-page.md`

## Architectural decisions

- **Routes**: `/quotes` (list), `/quotes/[id]` (single quote detail), `/api/quotes` (GET list, POST create), `/api/quotes/[id]` (GET single)
- **Schema**: Two D1 tables — `quotes` (id UUID, text, author, source nullable, favorite 0/1, created_at ISO 8601) and `quote_tags` (quote_id FK, tag). Tags joined and aggregated into an array on read.
- **Key models**: `Quote { id: string, text: string, author: string, source: string | null, favorite: boolean, tags: string[], created_at: string }`
- **Data access**: All D1 queries go through a single server-side data layer module. No direct DB calls in routes or components.
- **Authentication**: POST API protected by Bearer token compared against a Cloudflare secret env var. All GET routes are public.
- **Filtering**: Client-side in-memory filtering (search, tags, favorites) after SSR initial load. No round-trips on user interaction.
- **Image export**: Client-side only using html2canvas. Never runs during SSR.
- **Styling**: Existing CSS custom properties approach — no new CSS framework.
- **Infrastructure**: D1 binding declared in `wrangler.jsonc`. API token stored as a Cloudflare secret via `wrangler secret put`.

---

## Phase 1: Foundation — Schema, Data Layer & Read API

**User stories**: 18 (optional source/tags), 19 (favorites), 20 (UUID IDs)

### What to build

Provision the Cloudflare D1 database and declare its binding in `wrangler.jsonc`. Create the SQL migration for the `quotes` and `quote_tags` tables. Build the server-side data layer module exposing `getQuotes(filters)` and `getQuote(id)` — the only place in the codebase that touches D1. Wire up two public SvelteKit API routes: `GET /api/quotes` (returns full list with tags joined) and `GET /api/quotes/[id]` (returns single quote or 404 JSON). Seed a few quotes manually via D1 console or migration to verify the whole stack.

### Acceptance criteria

- [ ] D1 database created and binding present in `wrangler.jsonc`
- [ ] SQL migration creates `quotes` and `quote_tags` tables with correct columns and FK
- [ ] `GET /api/quotes` returns a JSON array of `Quote` objects with tags as `string[]`
- [ ] `GET /api/quotes/[id]` returns the correct quote for a known id
- [ ] `GET /api/quotes/[id]` returns a JSON 404 response for an unknown id
- [ ] Data layer integration tests pass: `getQuotes()`, `getQuote(id)`, `getQuote('nonexistent')`

---

## Phase 2: Quotes List Page

**User stories**: 1 (browse list), 2 (text/author/source/tags displayed), 3 (favorite indicator), 15 (fast), 16 (responsive)

### What to build

Create the `/quotes` route with a `+page.server.ts` that loads all quotes via the data layer and passes them to the page. Build the `QuoteCard` Svelte component showing quote text (large), author, source (if present), tag chips, and a star/heart icon for favorited quotes. Render a grid of `QuoteCard`s on the list page, each wrapped in an anchor linking to `/quotes/[id]`. Style everything using the existing CSS custom properties (purple accent, Inter font, 780px max-width). Activate the `/quotes` navigation link in the site header. Ensure the layout is mobile-responsive.

### Acceptance criteria

- [ ] `/quotes` renders server-side with all quotes from D1
- [ ] Each card shows: quote text, author, source (or omitted if null), tag chips, favorite star when `favorite === true`
- [ ] Clicking a card navigates to `/quotes/[id]`
- [ ] Page is responsive at 640px and 500px breakpoints
- [ ] Navigation link to `/quotes` is active in the header
- [ ] Page loads without client-side JS (pure SSR render works)

---

## Phase 3: Search, Tag Filtering & Favorites Toggle

**User stories**: 4 (real-time search), 5 (search all fields), 6 (clickable tag chips), 7 (favorites toggle), 8 (combined filters)

### What to build

Add client-side reactive state to the list page for: a search string, a set of active tag filters, and a favorites-only boolean. Render a search input above the quote grid. All quotes are already in-memory from SSR; filtering is computed client-side with no network requests. Search does case-insensitive substring matching across text, author, source, and tags simultaneously. Clicking a tag chip on any card toggles that tag as an active filter. A "Favorites only" toggle button shows/hides based on the `favorite` field. All three filter dimensions combine with AND logic.

### Acceptance criteria

- [ ] Typing in the search box filters the visible cards in real time
- [ ] Search matches against text, author, source, and tags
- [ ] Clicking a tag chip activates it as a filter; clicking again deactivates it
- [ ] Active tag chips are visually distinguished from inactive ones
- [ ] "Favorites only" toggle shows only `favorite === true` cards when on
- [ ] Search + tag + favorites filters all apply simultaneously
- [ ] Empty-state message shown when no quotes match the current filters

---

## Phase 4: Protected POST API

**User stories**: 17 (add via API), 21 (reject unauthenticated requests)

### What to build

Add `POST /api/quotes` endpoint. Reads the request body (JSON with `text`, `author`, `source?`, `favorite?`, `tags?`). Validates the `Authorization: Bearer <token>` header against a Cloudflare secret env var; returns 401 immediately on mismatch. On valid auth, generates a UUID for the new quote, inserts into `quotes` and `quote_tags`, and returns 201 with the created `Quote` object. Store the secret via `wrangler secret put` — never in source.

### Acceptance criteria

- [ ] `POST /api/quotes` without auth header returns 401
- [ ] `POST /api/quotes` with wrong token returns 401
- [ ] `POST /api/quotes` with valid token and full body returns 201 and the created quote
- [ ] `POST /api/quotes` with valid token and optional fields omitted returns 201 (defaults applied)
- [ ] Created quote appears in subsequent `GET /api/quotes` response
- [ ] API route tests cover all four cases above

---

## Phase 5: Single Quote Page & Link Sharing

**User stories**: 9 (click to detail), 10 (clean layout), 11 (OG meta), 12 (share link button), 22 (404 handling)

### What to build

Create the `/quotes/[id]` route. `+page.server.ts` fetches the quote by id via the data layer; throws a SvelteKit 404 error if not found. `+page.svelte` renders the `QuoteCard` component (standalone, no link wrapper) at larger scale, plus two action buttons. The first button — "Share link" — copies the current page URL to the clipboard using the Clipboard API (with a brief visual confirmation). `<svelte:head>` sets `og:title` to the author name, `og:description` to a truncated version of the quote text, and `og:url` to the canonical permalink.

### Acceptance criteria

- [ ] `/quotes/[id]` renders the correct quote server-side
- [ ] Navigating to an unknown id shows the site's 404 page
- [ ] `og:title`, `og:description`, and `og:url` are present in the page `<head>`
- [ ] "Share link" button copies the URL to clipboard and shows a brief confirmation
- [ ] Clicking a quote card on the list page arrives at its detail page
- [ ] Back navigation returns to the list page

---

## Phase 6: Share as Image

**User stories**: 13 (download PNG), 14 (image looks polished)

### What to build

Add a second action button to the single quote page — "Share as image". When clicked, it calls the image export utility which uses html2canvas to capture the `QuoteCard` DOM node and triggers a PNG download. The utility runs only in browser event handlers (never SSR). Because html2canvas has known issues with CSS custom properties and external fonts, the QuoteCard may need computed/inline styles applied before capture to produce a correct snapshot. If capture fails, show an inline error message rather than a silent failure. Unit tests mock html2canvas and verify the download is triggered and errors are surfaced.

### Acceptance criteria

- [ ] "Share as image" button appears on the single quote page
- [ ] Clicking it downloads a PNG file named after the quote (e.g. `quote-<id>.png`)
- [ ] The downloaded image is visually recognizable as the quote card (text, author, styling)
- [ ] If html2canvas fails, an error message is shown inline (no silent failure)
- [ ] The button shows a loading state while capture is in progress
- [ ] Unit tests: download triggered on success, error shown on rejection
- [ ] Manually tested on mobile (iOS Safari, Android Chrome) due to canvas quirks
