export interface DiffSegment {
	text: string;
	changed: boolean;
}

function tokenize(text: string): string[] {
	return text.split(/(\s+)/).filter((token) => token.length > 0);
}

/** Word-level diff of `current` against `previous`. Segments come from `current`,
 *  marked `changed` where they aren't part of the longest common subsequence
 *  with `previous` — i.e. what's new or different at this level. */
export function diffWords(previous: string, current: string): DiffSegment[] {
	const a = tokenize(previous);
	const b = tokenize(current);
	const n = a.length;
	const m = b.length;

	const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
	for (let i = n - 1; i >= 0; i--) {
		for (let j = m - 1; j >= 0; j--) {
			lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
		}
	}

	const matchedB = new Array<boolean>(m).fill(false);
	let i = 0;
	let j = 0;
	while (i < n && j < m) {
		if (a[i] === b[j]) {
			matchedB[j] = true;
			i++;
			j++;
		} else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
			i++;
		} else {
			j++;
		}
	}

	const segments: DiffSegment[] = [];
	for (let k = 0; k < m; k++) {
		const changed = !matchedB[k] && b[k].trim() !== '';
		const last = segments[segments.length - 1];
		if (last && last.changed === changed) {
			last.text += b[k];
		} else {
			segments.push({ text: b[k], changed });
		}
	}
	return segments;
}
