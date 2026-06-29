-- ============================================================================
-- TASK ATTACHMENTS — files pinned to a card.
-- Run in the Supabase SQL Editor AFTER tasks-project-boards.sql
-- (reuses the membership helpers is_project_member / is_project_owner /
--  can_manage_project). Safe to re-run.
--
-- Files themselves are stored in the EXISTING `files` storage bucket under
-- `${user.id}/task-attachments/...`, so no new bucket or storage policies are
-- required — only this metadata table.
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  uploader_email TEXT,
  name TEXT NOT NULL,
  file_type TEXT,
  size BIGINT,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);

ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View project task attachments" ON task_attachments;
DROP POLICY IF EXISTS "Create project task attachments" ON task_attachments;
DROP POLICY IF EXISTS "Delete task attachments" ON task_attachments;

-- View: any member of the attachment's project.
CREATE POLICY "View project task attachments"
  ON task_attachments FOR SELECT
  USING (is_project_owner(project_id) OR is_project_member(project_id));

-- Create: a member uploading on their own behalf.
CREATE POLICY "Create project task attachments"
  ON task_attachments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (is_project_owner(project_id) OR is_project_member(project_id))
  );

-- Delete: the uploader, or a project owner/admin.
CREATE POLICY "Delete task attachments"
  ON task_attachments FOR DELETE
  USING (user_id = auth.uid() OR can_manage_project(project_id));
