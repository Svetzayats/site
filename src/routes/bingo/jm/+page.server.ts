import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const password = platform?.env?.BINGO_JM_PASSWORD;
	const authenticated = !!password && cookies.get('bingo_jm_session') === password;
	return { authenticated };
};

export const actions: Actions = {
	default: async ({ request, cookies, platform }) => {
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
};
