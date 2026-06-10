-- ============================================================================
-- PREVIEW LINKS — public access hardening
-- Run once in the Supabase SQL Editor, AFTER rls-policies.sql.
--
-- Why:
--   The original "Anyone can view active preview links by short code" policy let
--   the anonymous browser SELECT *every* column — including the (now hashed)
--   password — for any active link. The public viewer no longer queries the
--   table directly: pages/api/preview/[code].js does it server-side with the
--   service-role key, which bypasses RLS. So this broad anon policy is no longer
--   needed and is safe to drop. Owners keep full access to their own links via
--   the "Users can view own preview links" policy.
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view active preview links by short code" ON preview_links;
