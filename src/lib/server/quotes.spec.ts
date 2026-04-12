import { describe, it, expect } from 'vitest';
import { getQuotes, getQuote } from './quotes';

// Minimal mock that implements D1Database for unit testing.
// SQL is not executed — the mock returns the rows you supply.
// To test against a real D1 instance, use `wrangler dev --local`
// or @cloudflare/vitest-pool-workers.

function mockDB(rows: Record<string, unknown>[] = []): D1Database {
	let boundRows = rows;
	const stmt = (): D1PreparedStatement =>
		({
			bind(..._: unknown[]) {
				return stmt();
			},
			async all<T>() {
				return { results: boundRows as T[], success: true, meta: {} as D1Result<T>['meta'] };
			},
			async first<T>() {
				return (boundRows[0] ?? null) as T | null;
			},
			async run<T>() {
				return { results: [] as T[], success: true, meta: {} as D1Result<T>['meta'] };
			},
			async raw<T>() {
				return boundRows as T[];
			},
		}) as D1PreparedStatement;

	return {
		prepare(_sql: string) {
			return stmt();
		},
		async dump() {
			return new ArrayBuffer(0);
		},
		async batch<T>(_stmts: D1PreparedStatement[]) {
			return [{ results: boundRows as T[], success: true, meta: {} as D1Result<T>['meta'] }];
		},
		async exec(_query: string) {
			return { count: 0, duration: 0 };
		},
	} as D1Database;
}

const QUOTE_ROW = {
	id: 'abc-123',
	text: 'The obstacle is the way.',
	author: 'Marcus Aurelius',
	source: 'Meditations',
	favorite: 1,
	created_at: '2024-01-01T00:00:00.000Z',
	tags_csv: 'stoicism,philosophy',
};

const QUOTE_ROW_NO_TAGS = {
	id: 'def-456',
	text: 'We suffer more in imagination than in reality.',
	author: 'Seneca',
	source: null,
	favorite: 0,
	created_at: '2024-01-02T00:00:00.000Z',
	tags_csv: null,
};

describe('getQuotes', () => {
	it('returns all quotes with tags as string[]', async () => {
		const db = mockDB([QUOTE_ROW, QUOTE_ROW_NO_TAGS]);
		const quotes = await getQuotes(db);

		expect(quotes).toHaveLength(2);
		expect(quotes[0]).toEqual({
			id: 'abc-123',
			text: 'The obstacle is the way.',
			author: 'Marcus Aurelius',
			source: 'Meditations',
			favorite: true,
			tags: ['stoicism', 'philosophy'],
			created_at: '2024-01-01T00:00:00.000Z',
		});
	});

	it('returns empty tags array when quote has no tags', async () => {
		const db = mockDB([QUOTE_ROW_NO_TAGS]);
		const [quote] = await getQuotes(db);

		expect(quote.tags).toEqual([]);
		expect(quote.favorite).toBe(false);
		expect(quote.source).toBeNull();
	});

	it('returns empty array when there are no quotes', async () => {
		const db = mockDB([]);
		const quotes = await getQuotes(db);
		expect(quotes).toEqual([]);
	});
});

describe('getQuote', () => {
	it('returns the correct quote for a known id', async () => {
		const db = mockDB([QUOTE_ROW]);
		const quote = await getQuote(db, 'abc-123');

		expect(quote).not.toBeNull();
		expect(quote?.id).toBe('abc-123');
		expect(quote?.tags).toEqual(['stoicism', 'philosophy']);
		expect(quote?.favorite).toBe(true);
	});

	it('returns null for an unknown id', async () => {
		const db = mockDB([]); // first() returns null when no rows
		const quote = await getQuote(db, 'nonexistent');
		expect(quote).toBeNull();
	});
});
