-- Migration: add SMART goals to the engineering IC competency matrix tool
CREATE TABLE IF NOT EXISTS cm_goals (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  purpose       TEXT,
  challenges    TEXT,
  is_specific     INTEGER NOT NULL DEFAULT 0,
  is_measurable   INTEGER NOT NULL DEFAULT 0,
  is_achievable   INTEGER NOT NULL DEFAULT 0,
  is_relevant     INTEGER NOT NULL DEFAULT 0,
  is_time_bound   INTEGER NOT NULL DEFAULT 0,
  target_date   TEXT,
  status        TEXT NOT NULL DEFAULT 'not_started',
  visibility    TEXT NOT NULL DEFAULT 'private',
  steps         TEXT NOT NULL DEFAULT '[]',
  progress_log  TEXT NOT NULL DEFAULT '[]',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cm_goals_status ON cm_goals(status);
CREATE INDEX IF NOT EXISTS idx_cm_goals_target_date ON cm_goals(target_date);
CREATE INDEX IF NOT EXISTS idx_cm_goals_visibility ON cm_goals(visibility);
