import { marked } from 'marked';

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/<[^>]+>/g, '')
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/^-|-$/g, '');
}

const CALLOUT_ICONS: Record<string, string> = {
	note: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
	tip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
	warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

export function parseCallouts(html: string): string {
	return html.replace(
		/<blockquote>\s*<p>\[!(NOTE|TIP|WARNING)\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/g,
		(_, type, content) => {
			const t = type.toLowerCase();
			const label = type.charAt(0) + type.slice(1).toLowerCase();
			const icon = CALLOUT_ICONS[t] ?? '';
			return `<div class="callout callout-${t}"><div class="callout-icon">${icon}</div><div class="callout-body"><span class="callout-label">${label}</span><p>${content.trim()}</p></div></div>`;
		},
	);
}

function addHeadingIds(html: string): string {
	return html.replace(/<(h[2-4])([^>]*)>([\s\S]*?)<\/h[2-4]>/g, (_, tag, attrs, content) => {
		if (attrs.includes('id=')) return _;
		const id = slugify(content);
		return `<${tag} id="${id}"${attrs}>${content}</${tag}>`;
	});
}

export function renderMarkdown(content: string): string {
	const html = marked(content) as string;
	return addHeadingIds(parseCallouts(html));
}
