import { isAdminAuthenticated } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url, platform }) => {
	if (url.pathname === '/admin/login') return {};

	if (!isAdminAuthenticated(cookies, platform)) {
		redirect(303, '/admin/login');
	}

	return {};
};
