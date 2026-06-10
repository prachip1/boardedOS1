-- ============================================================================
-- FILES — storage bucket + project-aware access
-- Run ONCE in the Supabase SQL Editor, AFTER projects-members.sql
-- (reuses is_project_member / is_project_owner / can_manage_project).
-- Safe to re-run (idempotent).
--
-- Fixes two things that block the Files feature:
--   1. The 'files' storage bucket didn't exist — uploads had nowhere to go.
--   2. The files TABLE was owner-only, so project members couldn't see files
--      attached to a shared project. Now: if a file is tagged to a project,
--      every member of that project can see it (mirrors the task boards).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Storage bucket for uploaded files
--    Public-read (like 'logos') so getPublicUrl() and client share links work.
--    Writes/deletes are restricted to each user's own folder ({uid}/...).
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can read files" ON storage.objects;
CREATE POLICY "Public can read files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'files');

DROP POLICY IF EXISTS "Users upload own files" ON storage.objects;
CREATE POLICY "Users upload own files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users delete own files" ON storage.objects;
CREATE POLICY "Users delete own files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------------------
-- 2. files TABLE — project-aware RLS
--    view:   you own it, OR it's tagged to a project you belong to
--    create: you upload as yourself
--    update: you own it, OR you manage the project it's tagged to
--    delete: you own it, OR you manage the project it's tagged to
-- ----------------------------------------------------------------------------
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own files" ON files;
DROP POLICY IF EXISTS "Users can create own files" ON files;
DROP POLICY IF EXISTS "Users can update own files" ON files;
DROP POLICY IF EXISTS "Users can delete own files" ON files;

CREATE POLICY "View own or project files"
  ON files FOR SELECT
  USING (
    auth.uid() = user_id
    OR (project_id IS NOT NULL AND (is_project_owner(project_id) OR is_project_member(project_id)))
  );

CREATE POLICY "Create own files"
  ON files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own or managed-project files"
  ON files FOR UPDATE
  USING (auth.uid() = user_id OR (project_id IS NOT NULL AND can_manage_project(project_id)))
  WITH CHECK (auth.uid() = user_id OR (project_id IS NOT NULL AND can_manage_project(project_id)));

CREATE POLICY "Delete own or managed-project files"
  ON files FOR DELETE
  USING (auth.uid() = user_id OR (project_id IS NOT NULL AND can_manage_project(project_id)));
