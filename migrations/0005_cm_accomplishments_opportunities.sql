-- Migration: add per-skill accomplishments/opportunities text to competency matrix answers
ALTER TABLE cm_self_assessment_answers ADD COLUMN accomplishments TEXT;
ALTER TABLE cm_self_assessment_answers ADD COLUMN opportunities TEXT;
ALTER TABLE cm_review_answers ADD COLUMN accomplishments TEXT;
ALTER TABLE cm_review_answers ADD COLUMN opportunities TEXT;
