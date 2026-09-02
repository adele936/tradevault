/*
# Market Platform - User Data Tables

## Overview
Creates tables for premium user features: watchlists, saved calculations, and chat history.
All tables are owner-scoped (multi-user with sign-in).

## New Tables

### watchlist
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, defaults to auth.uid())
- `symbol` (text, not null) - stock or crypto ticker symbol
- `asset_type` (text, not null) - 'stock' or 'crypto'
- `name` (text, not null) - display name of the asset
- `added_at` (timestamptz, defaults to now())

### saved_calculations
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, defaults to auth.uid())
- `calculation_type` (text, not null) - e.g. 'compound', 'dca', 'position_sizer'
- `input_data` (jsonb, not null) - the input parameters
- `result_data` (jsonb, not null) - the calculated results
- `created_at` (timestamptz, defaults to now())

### chat_history
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, defaults to auth.uid())
- `role` (text, not null) - 'user' or 'assistant'
- `message` (text, not null)
- `created_at` (timestamptz, defaults to now())

## Security
- RLS enabled on all tables.
- Owner-scoped CRUD: each authenticated user can only access their own rows.
- No anon access (premium features require sign-in).
*/

CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('stock', 'crypto')),
  name text NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE (user_id, symbol, asset_type)
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_watchlist" ON watchlist;
CREATE POLICY "select_own_watchlist" ON watchlist FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_watchlist" ON watchlist;
CREATE POLICY "insert_own_watchlist" ON watchlist FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_watchlist" ON watchlist;
CREATE POLICY "delete_own_watchlist" ON watchlist FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS saved_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_type text NOT NULL,
  input_data jsonb NOT NULL,
  result_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_calculations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_calcs" ON saved_calculations;
CREATE POLICY "select_own_calcs" ON saved_calculations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_calcs" ON saved_calculations;
CREATE POLICY "insert_own_calcs" ON saved_calculations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_calcs" ON saved_calculations;
CREATE POLICY "delete_own_calcs" ON saved_calculations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chats" ON chat_history;
CREATE POLICY "select_own_chats" ON chat_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chats" ON chat_history;
CREATE POLICY "insert_own_chats" ON chat_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chats" ON chat_history;
CREATE POLICY "delete_own_chats" ON chat_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_calcs_user ON saved_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id);
