import { getAllPosts } from '$lib/server/blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { posts: getAllPosts() };
};
