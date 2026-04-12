## Problem Statement

I want a personal quotes page on my website where I can collect and display quotes that have meaning to me. Currently there is no place to store or share these quotes. I want to be able to browse them, search for specific ones, filter by favorites and tags, and easily share individual quotes with others — either as a direct link or as an image.

## Solution

A new `/quotes` route with a full-featured quotes browser backed by Cloudflare D1. Quotes are added via a protected API endpoint. The list page supports real-time search across all fields, tag filtering, and a favorites toggle. Each quote links to its own page at `/quotes/[id]` with social-friendly OG meta tags and two sharing options: copy the page URL or copy a PNG image of the quote card.

## User Stories

1. As a visitor, I want to browse all quotes on a nicely designed list page, so that I can discover quotes that resonate with me.
2. As a visitor, I want to see each quote displayed with its text, author, source, and tags, so that I have full context for the quote.
3. As a visitor, I want favorited quotes to show a star/heart indicator, so that I know which quotes are especially meaningful to the site owner.
4. As a visitor, I want to type in a search box and filter quotes in real time, so that I can quickly find a quote I'm looking for.
5. As a visitor, I want search to cover quote text, author name, source, and tags simultaneously, so that I can find quotes no matter which field I remember.
6. As a visitor, I want to click a tag chip on a quote card to filter the list by that tag, so that I can explore quotes by topic.
7. As a visitor, I want to toggle a "Favorites only" filter, so that I can see only the most highlighted quotes.
8. As a visitor, I want to combine search text and tag filters simultaneously, so that I can narrow down results precisely.
9. As a visitor, I want to click on a quote card and be taken to a dedicated page for that quote, so that I can view and share it in isolation.
10. As a visitor, I want the single quote page to have a clean, beautiful layout showing the full quote text, author, and source, so that it is pleasant to read and share.
11. As a visitor, I want the single quote page to have proper og:title and og:description meta tags containing the quote text and author, so that when I share the link on social media it shows a rich preview.
12. As a visitor, I want a "Share link" button on the single quote page that copies the URL to my clipboard, so that I can paste it anywhere quickly.
13. As a visitor, I want a "Share as image" button on the single quote page, so that I can copy a PNG of the quote card.
14. As a visitor, I want the generated image to look polished and match the site's visual style, so that it is worth sharing.
15. As a visitor, I want the quotes page to be fast even with many quotes, so that I don't experience lag while browsing or filtering.
16. As a visitor, I want the quotes page to be fully responsive on mobile, so that I can browse quotes on my phone.
17. As the site owner, I want to add quotes via a protected POST API endpoint, so that I can add new quotes without building an admin UI.
18. As the site owner, I want quotes to support optional source and tags fields, so that I have flexibility in how I categorize them.
19. As the site owner, I want to mark quotes as favorites, so that I can highlight the ones that matter most.
20. As the site owner, I want quote IDs to be stable UUIDs, so that permalink URLs never break when I reorder or add more quotes.
21. As the site owner, I want the API to reject unauthenticated POST requests with a 401 response, so that no one else can add quotes to my collection.
22. As a visitor following a shared link, I want the URL `/quotes/[id]` to return a proper 404 page if the quote doesn't exist, so that I get clear feedback rather than a broken page.

## Implementation Decisions

### Database (Cloudflare D1 — SQLite at the edge)
- Table `quotes`: `id` (TEXT, UUID primary key), `text` (TEXT, not null), `author` (TEXT, nullable), `source` (TEXT, nullable), `favorite` (INTEGER, 0 or 1), `created_at` (TEXT, ISO 8601).
- Table `quote_tags`: `quote_id` (TEXT, FK → quotes.id), `tag` (TEXT). Tags are normalized into a separate table for clean filtering and aggregation.
- Tags are joined back onto quote rows on read, aggregated into an array.

### Server data layer
- A single deep module encapsulates all D1 query logic.
- Public interface: `getQuotes(filters: { search?: string, tags?: string[], favoritesOnly?: boolean })` and `getQuote(id: string)`.
- No D1 calls anywhere else in the codebase — all database access goes through this module.
- Returns typed `Quote` objects with tags as `string[]`.

### API routes (SvelteKit `+server.ts`)
- `GET /api/quotes` — returns full quotes list (public). Accepts query params for server-side filtering if needed in future.
- `GET /api/quotes/[id]` — returns a single quote or 404 JSON (public).
- `POST /api/quotes` — creates a new quote. Requires `Authorization: Bearer <token>` header matched against a Cloudflare secret env var. Returns 401 on mismatch, 201 with created quote on success.
- All responses are JSON.

### List page (`/quotes`)
- `+page.server.ts` loads all quotes server-side on first render and passes them to the page.
- `+page.svelte` holds reactive client state for search string, active tag filters, and favorites toggle.
- Filtering and search happen entirely in-memory on the client — no round-trips on user interaction. This is sufficient for a personal collection.
- Search does case-insensitive substring matching across text, author, source, and tags.

### QuoteCard component
- A reusable Svelte component shared between the list page and the single quote page.
- Props: a `Quote` object.
- Displays: quote text (large, styled), author, source (if present), tag chips, and a star/heart icon if `favorite === true`.
- On the list page, the card is wrapped in an anchor tag linking to `/quotes/[id]`.
- On the single quote page, the card is rendered standalone without the link wrapper.

### Single quote page (`/quotes/[id]`)
- `+page.server.ts` fetches the quote by id; throws a SvelteKit 404 error if not found.
- `+page.svelte` renders the QuoteCard and two action buttons: "Share link" and "Share as image".
- `<svelte:head>` sets `og:title` (author name), `og:description` (truncated quote text), and `og:url` (canonical quote permalink).

### Client-side image export
- A standalone utility module (not a Svelte component) with a single exported function: `exportQuoteAsImage(element: HTMLElement, filename: string)`.
- Uses `html2canvas` to capture the QuoteCard DOM node and triggers a PNG to be copied to clipboard  
- Called only in browser event handlers, never during SSR.
- Includes graceful error handling — if canvas capture fails, shows a user-facing error message rather than silently failing.
- Note: html2canvas has known quirks with CSS custom properties and external fonts. The card's styles may need a self-contained fallback for the captured snapshot.

### Styling
- Follows the existing CSS custom properties approach (`--color-accent`, font variables, spacing tokens).
- No new CSS frameworks introduced.
- Quote cards use the site's purple accent palette and Inter font.
- Max-width constraint of 780px maintained on list page.

### Infrastructure
- D1 database binding added to `wrangler.jsonc`.
- API token stored as a Cloudflare secret (never in source code or env files).

## Testing Decisions

Good tests verify external behavior — what the system returns given specific inputs — not implementation details like SQL query structure or internal variable names.

**Server data layer**: Integration tests using a real D1 test database (Vitest + Miniflare or D1 local). Test cases:
- `getQuotes()` returns all quotes with tags joined.
- `getQuotes({ search: 'stoic' })` returns only matching quotes.
- `getQuotes({ tags: ['philosophy'] })` returns only quotes with that tag.
- `getQuotes({ favoritesOnly: true })` returns only favorited quotes.
- `getQuote(id)` returns the correct quote.
- `getQuote('nonexistent')` returns null/undefined.

**API routes**: Test that:
- `GET /api/quotes` returns a 200 with an array.
- `GET /api/quotes/[id]` returns 404 for unknown IDs.
- `POST /api/quotes` without auth returns 401.
- `POST /api/quotes` with valid token and body returns 201 and the created quote.

**Client-side image export**: Unit test with mocked html2canvas and DOM:
- Verify the function calls html2canvas with the correct element.
- Verify error path shows an error message when html2canvas rejects.

Prior art for test file structure: `src/lib/vitest-examples/` in the project.

## Out of Scope

- Admin UI for editing or deleting existing quotes.
- Pagination of the quotes list (personal collection assumed manageable without it).
- Server-side full-text search (client-side substring match is sufficient at this scale).
- User authentication or visitor personalization (e.g., visitors marking their own favorites).
- Commenting, liking, or other social features beyond sharing.
- Importing quotes in bulk from external sources.
- Server-side image generation via Satori or OG image API endpoints.
- Editing existing quotes via the API (POST creates only; no PUT/PATCH).

## Further Notes

- The `/quotes` route is already referenced (commented out) in the site navigation, confirming this is a planned page.
- `html2canvas` has known limitations with CSS custom properties and Google Fonts loaded via `@import`. The image export may require the QuoteCard to use inline or computed styles for the canvas snapshot. Test on real devices before shipping.
- The API token for `POST /api/quotes` must be stored as a Cloudflare secret via `wrangler secret put`, never committed to the repo.
- UUID-based quote IDs ensure that permalink URLs remain stable as the collection grows or is reordered.
