-- Add optional contract columns if your contracts table was created before these existed.
-- Run once in Supabase SQL Editor if you get errors about missing columns.

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deliverables TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS terms TEXT;
