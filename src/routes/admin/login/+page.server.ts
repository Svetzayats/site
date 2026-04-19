import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const adminPassword = platform?.env?.ADMIN_PASSWORD;
	if (cookies.get('admin_session') === adminPassword) {
		redirect(303, '/admin/blog');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, platform }) => {
		const adminPassword = platform?.env?.ADMIN_PASSWORD;
		const data = await request.formData();
		const password = data.get('password') as string;

		if (!adminPassword || password !== adminPassword) {
			return fail(401, { error: 'Wrong password' });
		}

		cookies.set('admin_session', adminPassword, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7,
		});

		redirect(303, '/admin/blog');
	},
};
