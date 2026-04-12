import { json } from "@sveltejs/kit";
import { getQuote } from "$lib/server/quotes";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ platform, params }) => {
  const db = platform?.env.quotes_db;
  if (!db) {
    return json({ error: "Database not available" }, { status: 503 });
  }
  const quote = await getQuote(db, params.id);
  if (!quote) {
    return json({ error: "Quote not found" }, { status: 404 });
  }
  return json(quote);
};
