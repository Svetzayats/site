export interface Quote {
	id: string;
	text: string;
	author: string | null;
	source: string | null;
	favorite: boolean;
	tags: string[];
	created_at: string;
}

export interface CreateQuoteInput {
	text: string;
	author?: string;
	source?: string;
	favorite?: boolean;
	tags?: string[];
}

// Row shape returned from D1 for the joined query
interface QuoteRow {
	id: string;
	text: string;
	author: string;
	source: string | null;
	favorite: number; // 0 or 1 in SQLite
	created_at: string;
	tags_csv: string | null; // GROUP_CONCAT result, null when no tags
}

function rowToQuote(row: QuoteRow): Quote {
	return {
		id: row.id,
		text: row.text,
		author: row.author,
		source: row.source,
		favorite: row.favorite === 1,
		tags: row.tags_csv ? row.tags_csv.split(',') : [],
		created_at: row.created_at,
	};
}

const QUOTES_WITH_TAGS_SQL = `
  SELECT
    q.id, q.text, q.author, q.source, q.favorite, q.created_at,
    GROUP_CONCAT(qt.tag) AS tags_csv
  FROM quotes q
  LEFT JOIN quote_tags qt ON qt.quote_id = q.id
  GROUP BY q.id
  ORDER BY q.created_at DESC
`;

const QUOTE_BY_ID_SQL = `
  SELECT
    q.id, q.text, q.author, q.source, q.favorite, q.created_at,
    GROUP_CONCAT(qt.tag) AS tags_csv
  FROM quotes q
  LEFT JOIN quote_tags qt ON qt.quote_id = q.id
  WHERE q.id = ?
  GROUP BY q.id
`;

export async function getQuotes(db: D1Database): Promise<Quote[]> {
	const result = await db.prepare(QUOTES_WITH_TAGS_SQL).all<QuoteRow>();
	return result.results.map(rowToQuote);
}

export async function getQuote(db: D1Database, id: string): Promise<Quote | null> {
	const row = await db.prepare(QUOTE_BY_ID_SQL).bind(id).first<QuoteRow>();
	return row ? rowToQuote(row) : null;
}

export async function createQuote(db: D1Database, input: CreateQuoteInput): Promise<Quote> {
	const id = crypto.randomUUID();
	const created_at = new Date().toISOString();
	const favorite = input.favorite ? 1 : 0;
	const author = input.author ?? null;
	const source = input.source ?? null;
	const tags = input.tags ?? [];

	await db
		.prepare(
			'INSERT INTO quotes (id, text, author, source, favorite, created_at) VALUES (?, ?, ?, ?, ?, ?)',
		)
		.bind(id, input.text, author, source, favorite, created_at)
		.run();

	if (tags.length > 0) {
		const tagInserts = tags.map((tag) =>
			db.prepare('INSERT INTO quote_tags (quote_id, tag) VALUES (?, ?)').bind(id, tag),
		);
		await db.batch(tagInserts);
	}

	return {
		id,
		text: input.text,
		author,
		source,
		favorite: favorite === 1,
		tags,
		created_at,
	};
}
