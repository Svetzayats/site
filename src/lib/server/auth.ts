import type { Cookies } from '@sveltejs/kit';

export function isAdminAuthenticated(cookies: Cookies, platform: App.Platform | undefined): boolean {
	const adminPassword = platform?.env?.ADMIN_PASSWORD;
	return !!adminPassword && cookies.get('admin_session') === adminPassword;
}
