import { getPost, getAllPosts } from '$lib/server/blog';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

function readingTime(text: string): number {
	const words = text.trim().split(/\s+/).length;
	return Math.max(1, Math.round(words / 200));
}

export const load: PageServerLoad = async ({ params }) => {
	const post = getPost(params.slug);
	if (!post) error(404, 'Post not found');

	const all = getAllPosts();
	const idx = all.findIndex((p) => p.slug === params.slug);
	const prev = idx < all.length - 1 ? all[idx + 1] : null;
	const next = idx > 0 ? all[idx - 1] : null;

	return { post, readingTime: readingTime(post.raw), prev, next };
};
