import { isAdminAuthenticated } from '$lib/server/auth';
import { githubGet, githubPut } from '$lib/server/github';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, platform }) => {
	if (!isAdminAuthenticated(cookies, platform)) error(401, 'Unauthorized');

	const token = platform?.env?.GITHUB_TOKEN;
	if (!token) error(500, 'GITHUB_TOKEN not configured');

	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const filename = (formData.get('filename') as string | null)?.trim();

	if (!file || !filename) error(400, 'Missing file or filename');

	const buffer = await file.arrayBuffer();
	const path = `static/images/blog/${filename}`;

	const existing = await githubGet(path, token);
	const ok = await githubPut(path, token, buffer, `Add image: ${filename}`, existing?.sha);
	if (!ok) error(500, 'GitHub upload failed');

	return json({ path: `/images/blog/${filename}` });
};
