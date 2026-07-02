import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCards, addCard } from '$lib/server/bingo';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const password = platform?.env?.BINGO_JM_PASSWORD;
	const authenticated = !!password && cookies.get('bingo_jm_session') === password;
	const cards = authenticated ? await getCards(platform.env.quotes_db) : [];
	return { authenticated, cards };
};

export const actions: Actions = {
	login: async ({ request, cookies, platform }) => {
		const password = platform?.env?.BINGO_JM_PASSWORD;
		const data = await request.formData();
		const input = data.get('password') as string;

		if (!password || input !== password) {
			return fail(401, { error: 'Wrong password' });
		}

		cookies.set('bingo_jm_session', password, {
			path: '/bingo/jm',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7,
		});

		return { authenticated: true };
	},

	addCard: async ({ request, cookies, platform }) => {
		const password = platform?.env?.BINGO_JM_PASSWORD;
		if (!password || cookies.get('bingo_jm_session') !== password) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const text = (data.get('text') as string)?.trim();
		if (!text) {
			return fail(400, { addError: 'Card text is required' });
		}

		await addCard(platform.env.quotes_db, text);
	},
};
