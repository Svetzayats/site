import { json } from '@sveltejs/kit';
import { getQuotes } from '$lib/server/quotes';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform }) => {
	const db = platform?.env.quotes_db;
	if (!db) {
		return json({ error: 'Database not available' }, { status: 503 });
	}
	const quotes = await getQuotes(db);
	return json(quotes);
};
