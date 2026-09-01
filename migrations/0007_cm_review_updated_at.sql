-- Migration: track last-updated time on reviews to support in-place editing
ALTER TABLE cm_reviews ADD COLUMN updated_at TEXT;
UPDATE cm_reviews SET updated_at = created_at WHERE updated_at IS NULL;
