import { marked } from 'marked';

export function parseCallouts(html: string): string {
	return html.replace(
		/<blockquote>\s*<p>\[!(NOTE|TIP|WARNING)\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/g,
		(_, type, content) => {
			const t = type.toLowerCase();
			const label = type.charAt(0) + type.slice(1).toLowerCase();
			return `<div class="callout callout-${t}"><span class="callout-label">${label}</span><p>${content.trim()}</p></div>`;
		},
	);
}

export function renderMarkdown(content: string): string {
	return parseCallouts(marked(content) as string);
}
