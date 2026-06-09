-- ============================================================================
-- PROJECT MEMBERS (role-based collaboration)
-- Run this AFTER schema.sql and rls-policies.sql, once, in the Supabase SQL Editor.
--
-- What this enables:
--   * Invite people to a project by their email address.
--   * Invited people automatically see that project in their own Projects list
--     the moment they log in with the same email — no manual sharing needed.
--   * Role-based access: owner / admin / member / viewer.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- linked once the invitee signs in
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- one membership row per (project, email)
  UNIQUE (project_id, email)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_email ON project_members(lower(email));
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- ----------------------------------------------------------------------------
-- HELPER FUNCTIONS (SECURITY DEFINER → bypass RLS to avoid policy recursion)
-- ----------------------------------------------------------------------------

-- Is the current user a member (by email) of the given project?
CREATE OR REPLACE FUNCTION is_project_member(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = p_project_id
      AND lower(pm.email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- Is the current user the owner of the given project?
CREATE OR REPLACE FUNCTION is_project_owner(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = p_project_id
      AND p.user_id = auth.uid()
  );
$$;

-- Does the current user manage (own or admin) the given project?
CREATE OR REPLACE FUNCTION can_manage_project(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    is_project_owner(p_project_id)
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = p_project_id
        AND lower(pm.email) = lower(auth.jwt() ->> 'email')
        AND pm.role IN ('owner', 'admin')
    );
$$;

-- Called by the app after login: links the current user's id to any
-- invitations addressed to their email and flips them to 'active'.
-- SECURITY DEFINER so a plain member can claim their own row without being
-- granted a general UPDATE permission (which would let them change roles).
CREATE OR REPLACE FUNCTION claim_project_memberships()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE project_members
  SET user_id = auth.uid(), status = 'active'
  WHERE lower(email) = lower(auth.jwt() ->> 'email')
    AND (user_id IS DISTINCT FROM auth.uid() OR status <> 'active');
$$;

-- ----------------------------------------------------------------------------
-- NOTE ON AUTO-LINKING
-- We deliberately do NOT create a trigger on auth.users — Supabase locks the
-- auth schema and that would fail with a permission error. It isn't needed:
-- project visibility is decided by matching the member's email against the
-- logged-in user's email (auth.jwt() ->> 'email') in the RLS policies below.
-- So an invited person sees the project the moment they sign in with that
-- email, regardless of the user_id column. The app marks the row 'active' on
-- first access (see lib/api/projects.js).
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- UPDATE PROJECTS RLS: owner OR invited member can view the project.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own or member projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id OR is_project_member(id));

-- Owners and admins can update; (insert/delete remain owner-only from rls-policies.sql)
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Owners and admins can update projects"
  ON projects FOR UPDATE
  USING (can_manage_project(id))
  WITH CHECK (can_manage_project(id));

-- ----------------------------------------------------------------------------
-- PROJECT MEMBERS RLS
-- ----------------------------------------------------------------------------
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- You can see a membership row if it's yours, or if you can manage the project.
DROP POLICY IF EXISTS "View project members" ON project_members;
CREATE POLICY "View project members"
  ON project_members FOR SELECT
  USING (
    lower(email) = lower(auth.jwt() ->> 'email')
    OR is_project_owner(project_id)
    OR can_manage_project(project_id)
  );

-- Only owners/admins can invite members.
DROP POLICY IF EXISTS "Manage project members - insert" ON project_members;
CREATE POLICY "Manage project members - insert"
  ON project_members FOR INSERT
  WITH CHECK (can_manage_project(project_id));

-- Only owners/admins can change roles.
DROP POLICY IF EXISTS "Manage project members - update" ON project_members;
CREATE POLICY "Manage project members - update"
  ON project_members FOR UPDATE
  USING (can_manage_project(project_id))
  WITH CHECK (can_manage_project(project_id));

-- Owners/admins can remove anyone; members can remove themselves (leave project).
DROP POLICY IF EXISTS "Manage project members - delete" ON project_members;
CREATE POLICY "Manage project members - delete"
  ON project_members FOR DELETE
  USING (
    can_manage_project(project_id)
    OR lower(email) = lower(auth.jwt() ->> 'email')
  );
