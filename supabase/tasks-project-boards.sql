-- ============================================================================
-- TASKS → PROJECT-SCOPED COLLABORATIVE BOARDS
-- Run ONCE in the Supabase SQL Editor, AFTER:
--   schema.sql, tasks-schema.sql, rls-policies.sql, projects-members.sql
-- (it reuses the membership helpers is_project_member / is_project_owner /
--  can_manage_project defined in projects-members.sql).
--
-- What changes:
--   * Kanban columns move from per-USER to per-PROJECT — every project gets its
--     own board (To Do / In Progress / Review / Done), created with the project.
--   * Access is by project membership + role instead of owner-only:
--       - any member sees the board and all its cards;
--       - members can create cards and comment;
--       - members can edit/move only cards assigned to them or that they created;
--       - owners/admins manage columns, assign, and delete any card.
--   * `assignee` now holds the member's EMAIL (matches project_members), so RLS
--     can grant the assignee edit rights on their own card.
--   * Comments carry the author's email so we can show "who said what" without
--     depending on user_profiles visibility.
--
-- NOTE: pre-existing personal-board columns/tasks (project_id IS NULL) simply
-- stop appearing — the new boards are project-scoped. That's expected for a
-- pre-launch dataset.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Columns become project-scoped
-- ----------------------------------------------------------------------------
ALTER TABLE task_columns
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_task_columns_project_id ON task_columns(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- Comments: remember who wrote each one (independent of user_profiles RLS).
ALTER TABLE task_comments
  ADD COLUMN IF NOT EXISTS author_email TEXT;

-- ----------------------------------------------------------------------------
-- 2. Default columns are now created per PROJECT, not per user at signup
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS create_user_task_columns ON auth.users;

CREATE OR REPLACE FUNCTION create_default_project_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO task_columns (user_id, project_id, name, color, position) VALUES
    (NEW.user_id, NEW.id, 'To Do',       '#6b7280', 1),
    (NEW.user_id, NEW.id, 'In Progress', '#3b82f6', 2),
    (NEW.user_id, NEW.id, 'Review',      '#f59e0b', 3),
    (NEW.user_id, NEW.id, 'Done',        '#10b981', 4);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_project_columns ON projects;
CREATE TRIGGER create_project_columns
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION create_default_project_columns();

-- ----------------------------------------------------------------------------
-- 3. Backfill boards for projects that already exist
-- ----------------------------------------------------------------------------
INSERT INTO task_columns (user_id, project_id, name, color, position)
SELECT p.user_id, p.id, d.name, d.color, d.position
FROM projects p
CROSS JOIN (VALUES
  ('To Do', '#6b7280', 1),
  ('In Progress', '#3b82f6', 2),
  ('Review', '#f59e0b', 3),
  ('Done', '#10b981', 4)
) AS d(name, color, position)
WHERE NOT EXISTS (
  SELECT 1 FROM task_columns tc WHERE tc.project_id = p.id
);

-- ----------------------------------------------------------------------------
-- 4. RLS — TASK COLUMNS (view = any member; manage = owner/admin)
-- ----------------------------------------------------------------------------
ALTER TABLE task_columns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own task columns" ON task_columns;
DROP POLICY IF EXISTS "Users can create own task columns" ON task_columns;
DROP POLICY IF EXISTS "Users can update own task columns" ON task_columns;
DROP POLICY IF EXISTS "Users can delete own task columns" ON task_columns;

CREATE POLICY "View project board columns"
  ON task_columns FOR SELECT
  USING (is_project_owner(project_id) OR is_project_member(project_id));

CREATE POLICY "Manage board columns - insert"
  ON task_columns FOR INSERT
  WITH CHECK (can_manage_project(project_id));

CREATE POLICY "Manage board columns - update"
  ON task_columns FOR UPDATE
  USING (can_manage_project(project_id))
  WITH CHECK (can_manage_project(project_id));

CREATE POLICY "Manage board columns - delete"
  ON task_columns FOR DELETE
  USING (can_manage_project(project_id));

-- ----------------------------------------------------------------------------
-- 5. RLS — TASKS
--    view:   any member of the task's project
--    create: any member (must stamp themselves as user_id)
--    update: owner/admin, OR the creator, OR the assignee (by email)
--    delete: owner/admin, OR the creator
-- ----------------------------------------------------------------------------
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

CREATE POLICY "View project tasks"
  ON tasks FOR SELECT
  USING (is_project_owner(project_id) OR is_project_member(project_id));

CREATE POLICY "Create project tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (is_project_owner(project_id) OR is_project_member(project_id))
  );

CREATE POLICY "Update project tasks"
  ON tasks FOR UPDATE
  USING (
    can_manage_project(project_id)
    OR user_id = auth.uid()
    OR lower(assignee) = lower(auth.jwt() ->> 'email')
  )
  WITH CHECK (
    can_manage_project(project_id)
    OR user_id = auth.uid()
    OR lower(assignee) = lower(auth.jwt() ->> 'email')
  );

CREATE POLICY "Delete project tasks"
  ON tasks FOR DELETE
  USING (can_manage_project(project_id) OR user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 6. RLS — TASK COMMENTS (any member can read & post; authors edit/delete own)
-- ----------------------------------------------------------------------------
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view comments on own tasks" ON task_comments;
DROP POLICY IF EXISTS "Users can create comments on own tasks" ON task_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON task_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON task_comments;

CREATE POLICY "View project task comments"
  ON task_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_comments.task_id
      AND (is_project_owner(t.project_id) OR is_project_member(t.project_id))
  ));

CREATE POLICY "Create project task comments"
  ON task_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_comments.task_id
        AND (is_project_owner(t.project_id) OR is_project_member(t.project_id))
    )
  );

CREATE POLICY "Update own task comments"
  ON task_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Delete own task comments"
  ON task_comments FOR DELETE
  USING (auth.uid() = user_id);
