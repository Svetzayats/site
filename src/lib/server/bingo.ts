export interface BingoCard {
	id: string;
	text: string;
}

export async function getCards(db: D1Database): Promise<BingoCard[]> {
	const result = await db
		.prepare('SELECT id, text FROM bingo_cards ORDER BY created_at ASC')
		.all<BingoCard>();
	return result.results;
}

export async function addCard(db: D1Database, text: string): Promise<void> {
	const id = crypto.randomUUID();
	const created_at = new Date().toISOString();
	await db
		.prepare('INSERT INTO bingo_cards (id, text, created_at) VALUES (?, ?, ?)')
		.bind(id, text, created_at)
		.run();
}
