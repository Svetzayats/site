-- Migration: create quotes and quote_tags tables
CREATE TABLE IF NOT EXISTS quotes (
  id         TEXT PRIMARY KEY,
  text       TEXT NOT NULL,
  author     TEXT,
  source     TEXT,
  favorite   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quote_tags (
  quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  tag      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quote_tags_quote_id ON quote_tags(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_tags_tag      ON quote_tags(tag);
