-- ============================================================================
-- Launch migration — run ONCE in Supabase (SQL Editor) before going live.
-- Safe to re-run (idempotent).
-- New installs that ran schema.sql still need the storage bucket section below.
-- ============================================================================

-- 1. Invoice currency -------------------------------------------------------
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';

-- 2. Business logo on user profile ------------------------------------------
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. Public storage bucket for business logos -------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies (drop-then-create so this stays idempotent)
DROP POLICY IF EXISTS "Public can read logos" ON storage.objects;
CREATE POLICY "Public can read logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "Users upload own logos" ON storage.objects;
CREATE POLICY "Users upload own logos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users update own logos" ON storage.objects;
CREATE POLICY "Users update own logos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users delete own logos" ON storage.objects;
CREATE POLICY "Users delete own logos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
