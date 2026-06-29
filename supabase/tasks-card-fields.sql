-- ============================================================================
-- Trello-style card fields for tasks: a label color and an inline checklist.
-- Run this in the Supabase SQL Editor after tasks-schema.sql / tasks-jira-fields.sql
-- Safe to re-run (all additions are IF NOT EXISTS).
-- ============================================================================

-- A single label color (hex) that tints the whole card on the board.
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS label_color TEXT;

-- Optional short label text shown next to the color swatch.
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS label_text TEXT;

-- Inline checklist stored on the task itself (no separate table needed — it
-- inherits the task's RLS). Shape: [{ "id": "...", "text": "...", "done": false }]
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS checklist JSONB NOT NULL DEFAULT '[]'::jsonb;
