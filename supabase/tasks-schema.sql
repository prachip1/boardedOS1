-- Kanban Task Management Schema
-- Run this in Supabase SQL Editor after the main schema.sql

-- ============================================================================
-- TABLES
-- ============================================================================

-- Task Columns/Boards (e.g., To Do, In Progress, Done)
CREATE TABLE IF NOT EXISTS task_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280',
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  column_id UUID REFERENCES task_columns(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
  due_date DATE,
  position INTEGER NOT NULL,
  tags TEXT[],
  assignee TEXT,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Comments/Activity
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_task_columns_user_id ON task_columns(user_id);
CREATE INDEX IF NOT EXISTS idx_task_columns_position ON task_columns(position);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_task_columns_updated_at BEFORE UPDATE ON task_columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE task_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Task Columns Policies
CREATE POLICY "Users can view own task columns"
  ON task_columns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own task columns"
  ON task_columns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task columns"
  ON task_columns FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own task columns"
  ON task_columns FOR DELETE
  USING (auth.uid() = user_id);

-- Tasks Policies
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Task Comments Policies
CREATE POLICY "Users can view comments on own tasks"
  ON task_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_comments.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on own tasks"
  ON task_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_comments.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments"
  ON task_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON task_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DEFAULT COLUMNS
-- ============================================================================

-- Function to create default columns for new users
-- SECURITY DEFINER is required: this runs as a trigger on auth.users during
-- signup, before the new user has a session — auth.uid() is NULL at that
-- point, so a normal (non-definer) call would be rejected by the
-- "Users can create own task columns" RLS policy and fail the whole signup
-- with a 500 "Database error saving new user".
CREATE OR REPLACE FUNCTION create_default_task_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO task_columns (user_id, name, color, position) VALUES
    (NEW.id, 'To Do', '#6b7280', 1),
    (NEW.id, 'In Progress', '#3b82f6', 2),
    (NEW.id, 'Review', '#f59e0b', 3),
    (NEW.id, 'Done', '#10b981', 4);
  RETURN NEW;
END;
$$;

-- Trigger to create default columns when user signs up
CREATE TRIGGER create_user_task_columns
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_task_columns();

-- ============================================================================
-- NOTES
-- ============================================================================

-- This schema provides:
-- 1. ✅ Customizable columns/boards
-- 2. ✅ Drag-and-drop task management
-- 3. ✅ Priority and status tracking
-- 4. ✅ Client/project association
-- 5. ✅ Time estimation and tracking
-- 6. ✅ Comments and activity log
-- 7. ✅ Tags for organization
-- 8. ✅ Default columns created on signup

-- After running this:
-- 1. Create the API functions in lib/api/tasks.js
-- 2. Build the Kanban board UI
-- 3. Add drag-and-drop with react-beautiful-dnd or @dnd-kit

