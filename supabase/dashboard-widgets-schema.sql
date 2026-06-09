-- Dashboard Widgets Schema
-- Run this in Supabase SQL Editor (OPTIONAL)
-- This allows users to customize their dashboard widgets

-- Dashboard Widgets Table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  widget_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_position ON dashboard_widgets(position);

-- RLS Policies
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own widgets"
  ON dashboard_widgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own widgets"
  ON dashboard_widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets"
  ON dashboard_widgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own widgets"
  ON dashboard_widgets FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- NOTE: This table is OPTIONAL
-- If you don't run this, the dashboard will still work with default widgets
-- It just won't remember your customizations after refresh

