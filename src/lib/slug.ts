export function titleWords(str: string): string[] {
	return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).filter(Boolean);
}

export function slugify(str: string): string {
	return titleWords(str).slice(0, 3).join('-');
}
