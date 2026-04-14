export interface Env {
	// Your site URL, e.g. https://svelte-site.pages.dev
	SITE_URL: string;
	// The same token used by your POST /api/quotes endpoint
	QUOTES_API_TOKEN: string;
	// Your Telegram bot token from BotFather
	TELEGRAM_BOT_TOKEN: string;
	// Your personal Telegram chat ID — only messages from this ID are accepted
	ALLOWED_CHAT_ID: string;
}

// ── Telegram types (minimal subset we need) ────────────────────────────────

interface TelegramMessage {
	message_id: number;
	chat: { id: number };
	text?: string;
}

interface TelegramUpdate {
	update_id: number;
	message?: TelegramMessage;
}

// ── Message parser ─────────────────────────────────────────────────────────
//
// Accepted format (author and tags are optional):
//
//   Quote text goes here
//   -- Author Name
//   #philosophy #stoicism
//
// Rules:
//   - Lines starting with "--" → author (everything after "--" trimmed)
//   - Words starting with "#"  → tags (collected from any line)
//   - Everything else          → quote text (joined with a space)

interface ParsedQuote {
	text: string;
	author?: string;
	tags: string[];
}

function parseMessage(raw: string): ParsedQuote | null {
	const lines = raw
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean);

	const tags: string[] = [];
	let author: string | undefined;
	const textParts: string[] = [];

	for (const line of lines) {
		if (line.startsWith('--')) {
			author = line.slice(2).trim() || undefined;
		} else {
			// Extract any #tags from this line, keep remaining text
			const withoutTags = line.replace(/#\w+/g, (match) => {
				tags.push(match.slice(1));
				return '';
			}).trim();

			if (withoutTags) {
				textParts.push(withoutTags);
			}
		}
	}

	const text = textParts.join(' ').trim();
	if (!text) return null;

	return { text, author, tags };
}

// ── Telegram helpers ───────────────────────────────────────────────────────

async function sendMessage(
	token: string,
	chatId: number,
	text: string
): Promise<void> {
	await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ chat_id: chatId, text }),
	});
}

// ── Worker entry point ─────────────────────────────────────────────────────

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// Telegram sends webhooks as POST — ignore everything else
		if (request.method !== 'POST') {
			return new Response('OK', { status: 200 });
		}

		let update: TelegramUpdate;
		try {
			update = (await request.json()) as TelegramUpdate;
		} catch {
			return new Response('Bad request', { status: 400 });
		}

		const message = update.message;
		if (!message?.text) {
			// Ignore non-text updates (stickers, photos, etc.)
			return new Response('OK', { status: 200 });
		}

		const chatId = message.chat.id;

		// Security: only accept messages from your own chat
		if (String(chatId) !== env.ALLOWED_CHAT_ID) {
			await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, 'Not authorised.');
			return new Response('OK', { status: 200 });
		}

		const parsed = parseMessage(message.text);
		if (!parsed) {
			await sendMessage(
				env.TELEGRAM_BOT_TOKEN,
				chatId,
				'Could not parse a quote. Send the text, optionally followed by:\n-- Author\n#tag1 #tag2'
			);
			return new Response('OK', { status: 200 });
		}

		// Post to your existing quotes API
		const apiUrl = `${env.SITE_URL.replace(/\/$/, '')}/api/quotes`;
		const apiResponse = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${env.QUOTES_API_TOKEN}`,
			},
			body: JSON.stringify(parsed),
		});

		if (!apiResponse.ok) {
			const body = await apiResponse.text();
			await sendMessage(
				env.TELEGRAM_BOT_TOKEN,
				chatId,
				`Failed to save quote (${apiResponse.status}): ${body}`
			);
			return new Response('OK', { status: 200 });
		}

		const saved = (await apiResponse.json()) as { id: string };
		const parts = [`Saved!`, `"${parsed.text}"`];
		if (parsed.author) parts.push(`— ${parsed.author}`);
		if (parsed.tags.length) parts.push(`Tags: ${parsed.tags.join(', ')}`);
		parts.push(`\nView: ${env.SITE_URL.replace(/\/$/, '')}/quotes/${saved.id}`);

		await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, parts.join('\n'));
		return new Response('OK', { status: 200 });
	},
};
