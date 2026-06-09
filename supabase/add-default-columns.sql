-- Add Default Task Columns for Existing Users
-- Run this ONCE in Supabase SQL Editor

-- STEP 1: Get your user ID
-- Run this first:
-- SELECT id FROM auth.users;

-- STEP 2: Replace YOUR_USER_ID_HERE with the UUID from step 1, then run:

-- Example with vibrant colors:
-- INSERT INTO task_columns (user_id, name, color, position) VALUES
--   ('YOUR_USER_ID_HERE', '📋 To Do', '#8b5cf6', 1),
--   ('YOUR_USER_ID_HERE', '🚀 In Progress', '#3b82f6', 2),
--   ('YOUR_USER_ID_HERE', '👀 Review', '#f59e0b', 3),
--   ('YOUR_USER_ID_HERE', '✅ Done', '#10b981', 4);

-- Default colors (more subtle):
INSERT INTO task_columns (user_id, name, color, position) VALUES
  ('YOUR_USER_ID_HERE', 'To Do', '#8b5cf6', 1),
  ('YOUR_USER_ID_HERE', 'In Progress', '#3b82f6', 2),
  ('YOUR_USER_ID_HERE', 'Review', '#f59e0b', 3),
  ('YOUR_USER_ID_HERE', 'Done', '#10b981', 4);

-- Verify it worked:
-- SELECT * FROM task_columns WHERE user_id = 'YOUR_USER_ID_HERE';

