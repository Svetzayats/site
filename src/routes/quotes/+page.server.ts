import { getQuotes } from '$lib/server/quotes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env.quotes_db;
	if (!db) {
		return { quotes: [] };
	}
	const quotes = await getQuotes(db);
	return { quotes };
};
