-- ============================================================================
-- Jira-style ticket fields for tasks
-- Run this in the Supabase SQL Editor after tasks-schema.sql / tasks-project-boards.sql
-- Safe to re-run (all additions are IF NOT EXISTS).
-- ============================================================================

-- Issue type — Task / Bug / Story / Epic (like Jira issue types)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS issue_type TEXT DEFAULT 'task';

-- Backfill + constrain the allowed values (drop first so re-runs don't error)
UPDATE tasks SET issue_type = 'task' WHERE issue_type IS NULL;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_issue_type_check;
ALTER TABLE tasks
  ADD CONSTRAINT tasks_issue_type_check
  CHECK (issue_type IN ('task', 'bug', 'story', 'epic'));

-- Agile estimation (story points) + a start date for scheduling.
-- (estimated_hours / actual_hours already exist from tasks-schema.sql)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS story_points INTEGER,
  ADD COLUMN IF NOT EXISTS start_date DATE;

-- Helpful filter index for board grouping by type.
CREATE INDEX IF NOT EXISTS idx_tasks_issue_type ON tasks(issue_type);
