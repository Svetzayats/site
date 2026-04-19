const GITHUB_OWNER = 'Svetzayats';
const GITHUB_REPO = 'site';

const BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;

function headers(token: string) {
	return {
		Authorization: `Bearer ${token}`,
		Accept: 'application/vnd.github+json',
		'Content-Type': 'application/json',
	};
}

export async function githubGet(path: string, token: string) {
	const res = await fetch(`${BASE}/${path}`, { headers: headers(token) });
	if (!res.ok) return null;
	return res.json() as Promise<{ sha: string; content: string }>;
}

export async function githubPut(
	path: string,
	token: string,
	content: string | ArrayBuffer,
	message: string,
	sha?: string,
) {
	const base64 = Buffer.from(content instanceof ArrayBuffer ? new Uint8Array(content) : content).toString('base64');

	const res = await fetch(`${BASE}/${path}`, {
		method: 'PUT',
		headers: headers(token),
		body: JSON.stringify({ message, content: base64, ...(sha ? { sha } : {}) }),
	});
	return res.ok;
}
