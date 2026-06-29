-- ============================================================================
-- ACTIVITY NOTIFICATIONS for project boards.
-- Run in the Supabase SQL Editor AFTER projects-members.sql (it reuses the
-- is_project_owner / is_project_member membership helpers). Safe to re-run.
--
-- Why a function: the notifications table's RLS only lets a user insert rows for
-- THEMSELVES (auth.uid() = user_id). To notify every member of a project when
-- something changes on a task/project, we need a SECURITY DEFINER function that
-- can write a row for each recipient — while still verifying the caller actually
-- belongs to that project so it can't be used to spam arbitrary users.
-- ============================================================================

-- 1. Allow 'task' and 'project' notification types (icons keyed off these).
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('invoice', 'contract', 'payment', 'comment', 'deadline', 'general', 'task', 'project'));

-- 2. Fan a notification out to everyone on a project (owner + linked members,
--    INCLUDING the actor, so people see their own activity in the feed too).
CREATE OR REPLACE FUNCTION notify_project(
  p_project_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
BEGIN
  -- Only a member/owner of the project may fan out notifications for it.
  IF NOT (is_project_owner(p_project_id) OR is_project_member(p_project_id)) THEN
    RETURN;
  END IF;

  SELECT user_id INTO v_owner FROM projects WHERE id = p_project_id;

  INSERT INTO notifications (user_id, type, title, message, link, read)
  SELECT DISTINCT r.uid, p_type, p_title, p_message, p_link, false
  FROM (
    SELECT v_owner AS uid
    UNION
    SELECT pm.user_id
    FROM project_members pm
    WHERE pm.project_id = p_project_id
      AND pm.user_id IS NOT NULL
  ) r
  WHERE r.uid IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION notify_project(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
