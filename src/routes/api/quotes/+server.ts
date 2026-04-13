import { json } from '@sveltejs/kit';
import { getQuotes, createQuote } from '$lib/server/quotes';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform }) => {
	const db = platform?.env.quotes_db;
	if (!db) {
		return json({ error: 'Database not available' }, { status: 503 });
	}
	const quotes = await getQuotes(db);
	return json(quotes);
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const expectedToken = platform?.env.QUOTES_API_TOKEN;
	const authHeader = request.headers.get('Authorization');
	const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

	if (!expectedToken || !token || token !== expectedToken) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = platform?.env.quotes_db;
	if (!db) {
		return json({ error: 'Database not available' }, { status: 503 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	if (
		typeof body !== 'object' ||
		body === null ||
		typeof (body as Record<string, unknown>).text !== 'string' ||
		typeof (body as Record<string, unknown>).author !== 'string'
	) {
		return json({ error: 'Missing required fields: text, author' }, { status: 400 });
	}

	const input = body as Record<string, unknown>;
	const quote = await createQuote(db, {
		text: input.text as string,
		author: input.author as string,
		source: typeof input.source === 'string' ? input.source : undefined,
		favorite: typeof input.favorite === 'boolean' ? input.favorite : false,
		tags: Array.isArray(input.tags) ? (input.tags as string[]) : [],
	});

	return json(quote, { status: 201 });
};
