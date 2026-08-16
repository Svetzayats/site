-- Migration: create engineering IC competency matrix tables
CREATE TABLE IF NOT EXISTS cm_self_assessments (
  id         TEXT PRIMARY KEY,
  level      TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cm_self_assessment_answers (
  assessment_id TEXT NOT NULL REFERENCES cm_self_assessments(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL,
  rating        TEXT NOT NULL,
  notes         TEXT
);

CREATE INDEX IF NOT EXISTS idx_cm_self_answers_assessment ON cm_self_assessment_answers(assessment_id);

CREATE TABLE IF NOT EXISTS cm_reviews (
  id                 TEXT PRIMARY KEY,
  reviewer_name      TEXT NOT NULL,
  self_assessment_id TEXT NOT NULL REFERENCES cm_self_assessments(id) ON DELETE CASCADE,
  created_at         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cm_review_answers (
  review_id     TEXT NOT NULL REFERENCES cm_reviews(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL,
  rating        TEXT NOT NULL,
  notes         TEXT
);

CREATE INDEX IF NOT EXISTS idx_cm_review_answers_review ON cm_review_answers(review_id);
CREATE INDEX IF NOT EXISTS idx_cm_reviews_reviewer ON cm_reviews(reviewer_name);
