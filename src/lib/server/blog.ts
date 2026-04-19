import matter from 'gray-matter';
import { renderMarkdown } from '$lib/markdown';

export interface Post {
	slug: string;
	title: string;
	date: string;
	tags: string[];
	excerpt: string;
	html: string;
	raw: string;
}

export interface PostMeta {
	slug: string;
	title: string;
	date: string;
	tags: string[];
	excerpt: string;
}

const files = import.meta.glob('/src/content/blog/*.md', { eager: true, query: '?raw', import: 'default' });

function slugFromPath(path: string): string {
	return path.split('/').pop()!.replace(/\.md$/, '');
}

function normalizeDate(d: unknown): string {
	return d instanceof Date ? d.toISOString().slice(0, 10) : ((d as string) ?? '');
}

let postsCache: PostMeta[] | null = null;
const postCache = new Map<string, Post | null>();

export function getAllPosts(): PostMeta[] {
	if (postsCache) return postsCache;
	postsCache = Object.entries(files)
		.map(([path, raw]) => {
			const { data } = matter(raw as string);
			return {
				slug: slugFromPath(path),
				title: (data.title as string) ?? slugFromPath(path),
				date: normalizeDate(data.date),
				tags: (data.tags as string[]) ?? [],
				excerpt: (data.excerpt as string) ?? '',
			};
		})
		.sort((a, b) => (a.date > b.date ? -1 : 1));
	return postsCache;
}

export function getPost(slug: string): Post | null {
	if (postCache.has(slug)) return postCache.get(slug)!;

	const entry = Object.entries(files).find(([path]) => slugFromPath(path) === slug);
	const result = entry ? (() => {
		const [, raw] = entry;
		const { data, content } = matter(raw as string);
		return {
			slug,
			title: (data.title as string) ?? slug,
			date: normalizeDate(data.date),
			tags: (data.tags as string[]) ?? [],
			excerpt: (data.excerpt as string) ?? '',
			html: renderMarkdown(content),
			raw: raw as string,
		};
	})() : null;

	postCache.set(slug, result);
	return result;
}
