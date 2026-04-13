import { describe, it, expect } from 'vitest';
import { POST } from './+server';
import type { Quote } from '$lib/server/quotes';

// ── Minimal D1 mock ────────────────────────────────────────────────────────
function mockDB(): D1Database {
	const stmt = (): D1PreparedStatement =>
		({
			bind(..._: unknown[]) {
				return stmt();
			},
			async all<T>() {
				return { results: [] as T[], success: true, meta: {} as D1Result<T>['meta'] };
			},
			async first<T>() {
				return null as T | null;
			},
			async run<T>() {
				return { results: [] as T[], success: true, meta: {} as D1Result<T>['meta'] };
			},
			async raw<T>() {
				return [] as T[];
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
			return [{ results: [] as T[], success: true, meta: {} as D1Result<T>['meta'] }];
		},
		async exec(_query: string) {
			return { count: 0, duration: 0 };
		},
	} as D1Database;
}

function makePlatform(token?: string): App.Platform {
	return {
		env: {
			quotes_db: mockDB(),
			ASSETS: {} as Fetcher,
			...(token ? { QUOTES_API_TOKEN: token } : {}),
		},
		ctx: {} as ExecutionContext,
		caches: {} as CacheStorage,
	};
}

function makeRequest(body: unknown, authHeader?: string): Request {
	return new Request('http://localhost/api/quotes', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(authHeader ? { Authorization: authHeader } : {}),
		},
		body: JSON.stringify(body),
	});
}

const VALID_BODY = { text: 'Act well your part.', author: 'Alexander Pope' };
const SECRET = 'test-secret';

// ── Tests ──────────────────────────────────────────────────────────────────

describe('POST /api/quotes', () => {
	it('returns 401 when Authorization header is missing', async () => {
		const response = await POST({
			request: makeRequest(VALID_BODY),
			platform: makePlatform(SECRET),
		} as Parameters<typeof POST>[0]);

		expect(response.status).toBe(401);
	});

	it('returns 401 when token is wrong', async () => {
		const response = await POST({
			request: makeRequest(VALID_BODY, 'Bearer wrong-token'),
			platform: makePlatform(SECRET),
		} as Parameters<typeof POST>[0]);

		expect(response.status).toBe(401);
	});

	it('returns 201 and the created quote with valid token and full body', async () => {
		const body = {
			...VALID_BODY,
			source: 'An Essay on Man',
			favorite: true,
			tags: ['poetry', 'virtue'],
		};

		const response = await POST({
			request: makeRequest(body, `Bearer ${SECRET}`),
			platform: makePlatform(SECRET),
		} as Parameters<typeof POST>[0]);

		expect(response.status).toBe(201);

		const quote = await response.json() as Quote;
		expect(quote.text).toBe(body.text);
		expect(quote.author).toBe(body.author);
		expect(quote.source).toBe(body.source);
		expect(quote.favorite).toBe(true);
		expect(quote.tags).toEqual(body.tags);
		expect(typeof quote.id).toBe('string');
		expect(typeof quote.created_at).toBe('string');
	});

	it('returns 201 with defaults when optional fields are omitted', async () => {
		const response = await POST({
			request: makeRequest(VALID_BODY, `Bearer ${SECRET}`),
			platform: makePlatform(SECRET),
		} as Parameters<typeof POST>[0]);

		expect(response.status).toBe(201);

		const quote = await response.json() as Quote;
		expect(quote.source).toBeNull();
		expect(quote.favorite).toBe(false);
		expect(quote.tags).toEqual([]);
	});

	it('returns 400 when body is missing required fields', async () => {
		const response = await POST({
			request: makeRequest({ author: 'No text here' }, `Bearer ${SECRET}`),
			platform: makePlatform(SECRET),
		} as Parameters<typeof POST>[0]);

		expect(response.status).toBe(400);
	});
});
