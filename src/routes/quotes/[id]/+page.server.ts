import { error } from '@sveltejs/kit';
import { getQuote } from '$lib/server/quotes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, params }) => {
	const db = platform?.env.quotes_db;
	if (!db) {
		error(503, 'Database not available');
	}
	const quote = await getQuote(db, params.id);
	if (!quote) {
		error(404, 'Quote not found');
	}
	return { quote };
};
