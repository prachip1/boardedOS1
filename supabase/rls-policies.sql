-- Row Level Security (RLS) Policies for Boarded
-- Run this AFTER schema.sql
-- This ensures users can only access their own data

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CLIENTS POLICIES
-- ============================================================================

-- Users can view their own clients
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own clients
CREATE POLICY "Users can create own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own clients
CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own clients
CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CONTRACTS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts"
  ON contracts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contracts"
  ON contracts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- INVOICES POLICIES
-- ============================================================================

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
  ON invoices FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- INVOICE ITEMS POLICIES
-- ============================================================================

-- Invoice items inherit permissions from parent invoice
CREATE POLICY "Users can view own invoice items"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own invoice items"
  ON invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice items"
  ON invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice items"
  ON invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TIME ENTRIES POLICIES
-- ============================================================================

CREATE POLICY "Users can view own time entries"
  ON time_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own time entries"
  ON time_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time entries"
  ON time_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own time entries"
  ON time_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRACKERS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own trackers"
  ON trackers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trackers"
  ON trackers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trackers"
  ON trackers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trackers"
  ON trackers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRACKER ENTRIES POLICIES
-- ============================================================================

CREATE POLICY "Users can view own tracker entries"
  ON tracker_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tracker entries"
  ON tracker_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracker entries"
  ON tracker_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracker entries"
  ON tracker_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PREVIEW LINKS POLICIES
-- ============================================================================

-- Users can view their own preview links
CREATE POLICY "Users can view own preview links"
  ON preview_links FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view active preview links by short code (for sharing)
CREATE POLICY "Anyone can view active preview links by short code"
  ON preview_links FOR SELECT
  USING (
    status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_views IS NULL OR views < max_views)
  );

CREATE POLICY "Users can create own preview links"
  ON preview_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preview links"
  ON preview_links FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preview links"
  ON preview_links FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FILES POLICIES
-- ============================================================================

CREATE POLICY "Users can view own files"
  ON files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own files"
  ON files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files"
  ON files FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON files FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FEEDBACK THREADS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own feedback threads"
  ON feedback_threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own feedback threads"
  ON feedback_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback threads"
  ON feedback_threads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback threads"
  ON feedback_threads FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FEEDBACK COMMENTS POLICIES
-- ============================================================================

-- Users can view comments on their threads
CREATE POLICY "Users can view comments on own threads"
  ON feedback_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM feedback_threads
      WHERE feedback_threads.id = feedback_comments.thread_id
      AND feedback_threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on own threads"
  ON feedback_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM feedback_threads
      WHERE feedback_threads.id = feedback_comments.thread_id
      AND feedback_threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments"
  ON feedback_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON feedback_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STORAGE POLICIES (Run in Supabase Dashboard > Storage)
-- ============================================================================

-- For 'files' bucket:
-- 1. Allow authenticated users to upload: INSERT with auth.uid() = bucket_id
-- 2. Allow users to read their own files: SELECT with auth.uid() = bucket_id
-- 3. Allow users to delete their own files: DELETE with auth.uid() = bucket_id

-- Example Storage Policy (apply in Dashboard):
/*
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- ============================================================================
-- NOTES
-- ============================================================================

-- Security Benefits:
-- 1. ✅ Users can only see/edit their own data
-- 2. ✅ Automatic filtering by user_id using auth.uid()
-- 3. ✅ No need to add WHERE user_id = xxx in application code
-- 4. ✅ Database-level security (can't bypass with API calls)
-- 5. ✅ Preview links have special public access when active

-- Next Steps:
-- 1. Test policies by creating a user and trying to access data
-- 2. Set up storage buckets and apply storage policies
-- 3. Create test data to verify RLS is working correctly

