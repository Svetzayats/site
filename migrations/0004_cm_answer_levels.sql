-- Migration: add per-skill level column to competency matrix answers
ALTER TABLE cm_self_assessment_answers ADD COLUMN level TEXT;
ALTER TABLE cm_review_answers ADD COLUMN level TEXT;
