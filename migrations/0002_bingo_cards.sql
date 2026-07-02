-- Migration: create bingo_cards table and seed initial cards
CREATE TABLE IF NOT EXISTS bingo_cards (
  id         TEXT PRIMARY KEY,
  text       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT INTO bingo_cards (id, text, created_at) VALUES
  (lower(hex(randomblob(16))), '113 years company', datetime('now')),
  (lower(hex(randomblob(16))), 'Progress', datetime('now')),
  (lower(hex(randomblob(16))), 'Innovative / innovation', datetime('now')),
  (lower(hex(randomblob(16))), 'Disrupt / disruptive / disruptors', datetime('now')),
  (lower(hex(randomblob(16))), 'Customer focused', datetime('now')),
  (lower(hex(randomblob(16))), 'Personalized / customized experience', datetime('now')),
  (lower(hex(randomblob(16))), 'Unstoppable', datetime('now')),
  (lower(hex(randomblob(16))), 'For jewelers', datetime('now')),
  (lower(hex(randomblob(16))), 'Extremely hard', datetime('now')),
  (lower(hex(randomblob(16))), 'Always for our customers', datetime('now')),
  (lower(hex(randomblob(16))), 'Foundation', datetime('now')),
  (lower(hex(randomblob(16))), 'Unifying / unified', datetime('now')),
  (lower(hex(randomblob(16))), 'Agent / AI', datetime('now')),
  (lower(hex(randomblob(16))), 'One platform', datetime('now'));
