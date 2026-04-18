export interface Env {
	SITE_URL: string;
	QUOTES_API_TOKEN: string;
	TELEGRAM_BOT_TOKEN: string;
	ALLOWED_CHAT_ID: string;
}

// ── Telegram types ─────────────────────────────────────────────────────────

interface TelegramMessage {
	message_id: number;
	chat: { id: number };
	text?: string;
}

interface TelegramCallbackQuery {
	id: string;
	from: { id: number };
	message?: TelegramMessage;
	data?: string;
}

interface TelegramUpdate {
	update_id: number;
	message?: TelegramMessage;
	callback_query?: TelegramCallbackQuery;
}

// ── Quote types ────────────────────────────────────────────────────────────

interface ParsedQuote {
	text: string;
	author?: string;
	tags: string[];
}

// ── Parsers ────────────────────────────────────────────────────────────────

// Parses the user's raw input message:
//
//   The obstacle is the way
//   -- Marcus Aurelius
//   #stoicism #philosophy
//
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
			const withoutTags = line
				.replace(/#\w+/g, (match) => {
					tags.push(match.slice(1));
					return '';
				})
				.trim();
			if (withoutTags) textParts.push(withoutTags);
		}
	}

	const text = textParts.join(' ').trim();
	if (!text) return null;

	return { text, author, tags };
}

// Formats a parsed quote as a structured preview that can be re-parsed.
// These labeled lines are the source of truth on confirmation.
function formatPreview(q: ParsedQuote): string {
	const lines = ['Ready to save?\n', `Text: ${q.text}`];
	if (q.author) lines.push(`Author: ${q.author}`);
	if (q.tags.length) lines.push(`Tags: ${q.tags.join(', ')}`);
	return lines.join('\n');
}

// Re-parses the labeled lines from the preview message.
// Called when the user taps Save — no storage needed.
function parsePreview(previewText: string): ParsedQuote | null {
	const lines = previewText.split('\n').map((l) => l.trim());

	const textLine = lines.find((l) => l.startsWith('Text: '));
	if (!textLine) return null;
	const text = textLine.slice('Text: '.length).trim();
	if (!text) return null;

	const authorLine = lines.find((l) => l.startsWith('Author: '));
	const author = authorLine ? authorLine.slice('Author: '.length).trim() : undefined;

	const tagsLine = lines.find((l) => l.startsWith('Tags: '));
	const tags = tagsLine
		? tagsLine
				.slice('Tags: '.length)
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean)
		: [];

	return { text, author, tags };
}

// ── Telegram API helpers ───────────────────────────────────────────────────

const CONFIRM_KEYBOARD = {
	inline_keyboard: [[
		{ text: '✅ Save', callback_data: 'confirm' },
		{ text: '❌ Cancel', callback_data: 'cancel' },
	]],
};

async function sendMessage(
	token: string,
	chatId: number,
	text: string,
	replyMarkup?: object
): Promise<void> {
	await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup }),
	});
}

// Replaces the preview message text and removes the buttons.
async function editMessage(
	token: string,
	chatId: number,
	messageId: number,
	text: string
): Promise<void> {
	await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			chat_id: chatId,
			message_id: messageId,
			text,
			reply_markup: { inline_keyboard: [] },
		}),
	});
}

// Acknowledges the button tap — clears the loading spinner on the button.
async function answerCallbackQuery(token: string, callbackQueryId: string): Promise<void> {
	await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ callback_query_id: callbackQueryId }),
	});
}

// ── Worker entry point ─────────────────────────────────────────────────────

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response('OK', { status: 200 });
		}

		let update: TelegramUpdate;
		try {
			update = (await request.json()) as TelegramUpdate;
		} catch {
			return new Response('Bad request', { status: 400 });
		}

		// ── Incoming text message → show preview + buttons ─────────────────

		if (update.message?.text) {
			const { message } = update;
			const chatId = message.chat.id;

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

			await sendMessage(
				env.TELEGRAM_BOT_TOKEN,
				chatId,
				formatPreview(parsed),
				CONFIRM_KEYBOARD
			);
			return new Response('OK', { status: 200 });
		}

		// ── Button tap → save or cancel ────────────────────────────────────

		if (update.callback_query) {
			const { callback_query } = update;
			const chatId = callback_query.from.id;
			const messageId = callback_query.message?.message_id;
			const previewText = callback_query.message?.text ?? '';

			// Always acknowledge to clear the spinner
			await answerCallbackQuery(env.TELEGRAM_BOT_TOKEN, callback_query.id);

			if (callback_query.data === 'cancel') {
				if (messageId) {
					await editMessage(env.TELEGRAM_BOT_TOKEN, chatId, messageId, 'Cancelled.');
				}
				return new Response('OK', { status: 200 });
			}

			if (callback_query.data === 'confirm') {
				const quote = parsePreview(previewText);
				if (!quote || !messageId) {
					await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, 'Could not read the quote. Please send it again.');
					return new Response('OK', { status: 200 });
				}

				const apiUrl = `${env.SITE_URL.replace(/\/$/, '')}/api/quotes`;
				const apiResponse = await fetch(apiUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${env.QUOTES_API_TOKEN}`,
					},
					body: JSON.stringify(quote),
				});

				if (!apiResponse.ok) {
					const body = await apiResponse.text();
					await editMessage(
						env.TELEGRAM_BOT_TOKEN,
						chatId,
						messageId,
						`Failed to save (${apiResponse.status}): ${body}`
					);
					return new Response('OK', { status: 200 });
				}

				const saved = (await apiResponse.json()) as { id: string };
				const parts = ['Saved! ✅', `"${quote.text}"`];
				if (quote.author) parts.push(`— ${quote.author}`);
				if (quote.tags.length) parts.push(`Tags: ${quote.tags.join(', ')}`);
				parts.push(`\nView: ${env.SITE_URL.replace(/\/$/, '')}/quotes/${saved.id}`);

				await editMessage(env.TELEGRAM_BOT_TOKEN, chatId, messageId, parts.join('\n'));
			}

			return new Response('OK', { status: 200 });
		}

		return new Response('OK', { status: 200 });
	},
};
