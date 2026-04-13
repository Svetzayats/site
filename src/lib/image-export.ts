/**
 * Captures an HTML element as a PNG and copies it to the clipboard.
 * Falls back to a PNG download if the Clipboard API is unavailable (e.g. iOS Safari).
 *
 * Tags (.tag-list) are stripped from the snapshot — the image shows only
 * the quote text, author, and source.
 *
 * html2canvas does not resolve CSS custom properties or @import fonts.
 * We work around this by inlining all computed styles on the cloned DOM
 * via the onclone callback before the snapshot is taken.
 */
export async function exportQuoteAsImage(element: HTMLElement, filename: string): Promise<'clipboard' | 'download'> {
	// Dynamic import keeps html2canvas out of the SSR bundle entirely.
	const { default: html2canvas } = await import('html2canvas');

	const canvas = await html2canvas(element, {
		scale: 2,
		useCORS: true,
		backgroundColor: null,
		onclone: (_doc: Document, cloned: HTMLElement) => {
			// Remove tags from the image — they clutter the shareable snapshot.
			cloned.querySelector('.tag-list')?.remove();
			inlineComputedStyles(element, cloned);
		},
	});

	const blob = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((b) => {
			if (b) resolve(b);
			else reject(new Error('Canvas toBlob returned null'));
		}, 'image/png');
	});

	// Try clipboard first; fall back to download on any failure.
	if (
		typeof ClipboardItem !== 'undefined' &&
		navigator.clipboard?.write
	) {
		try {
			await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
			return 'clipboard';
		} catch {
			// Permission denied or API not supported — fall through to download.
		}
	}

	downloadBlob(blob, filename);
	return 'download';
}

function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

/**
 * Recursively copies computed styles from a live DOM tree onto its clone
 * so that html2canvas sees resolved values instead of CSS var() references.
 */
function inlineComputedStyles(source: Element, target: Element): void {
	const computed = getComputedStyle(source);
	const el = target as HTMLElement;

	const props = [
		'color',
		'background-color',
		'background',
		'font-family',
		'font-size',
		'font-weight',
		'font-style',
		'line-height',
		'padding',
		'padding-top',
		'padding-right',
		'padding-bottom',
		'padding-left',
		'border',
		'border-radius',
		'border-color',
		'gap',
		'display',
		'flex-direction',
	];

	for (const prop of props) {
		const value = computed.getPropertyValue(prop);
		if (value) el.style.setProperty(prop, value);
	}

	const sourceChildren = source.children;
	const targetChildren = target.children;
	for (let i = 0; i < sourceChildren.length; i++) {
		if (targetChildren[i]) {
			inlineComputedStyles(sourceChildren[i], targetChildren[i]);
		}
	}
}
