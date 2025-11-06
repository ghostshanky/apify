/*
  # API Service Database Schema

  ## Overview
  This migration creates the complete database schema for a web scraping API service
  that allows users to interact with any website through API endpoints.

  ## New Tables
  
  ### 1. `api_keys`
  Stores API keys for authentication
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `key_name` (text) - Friendly name for the key
  - `api_key` (text, unique) - The actual API key (hashed)
  - `key_prefix` (text) - First 8 characters for display
  - `is_active` (boolean) - Whether key is active
  - `last_used_at` (timestamptz) - Last usage timestamp
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 2. `api_requests`
  Logs all API requests made
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `api_key_id` (uuid, foreign key) - References api_keys
  - `target_url` (text) - Website being accessed
  - `method` (text) - HTTP method (GET, POST, etc.)
  - `request_data` (jsonb) - Request payload
  - `response_data` (jsonb) - Response data
  - `status_code` (integer) - HTTP status code
  - `duration_ms` (integer) - Request duration in milliseconds
  - `created_at` (timestamptz) - Request timestamp
  
  ### 3. `user_profiles`
  Extended user information
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `total_requests` (integer) - Total API requests made
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Authenticated users required for all operations
  - Policies for SELECT, INSERT, UPDATE, DELETE operations

  ## Indexes
  - Indexes on foreign keys for performance
  - Index on api_key for fast lookups
  - Index on user_id and created_at for request history
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  total_requests integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name text NOT NULL,
  api_key text UNIQUE NOT NULL,
  key_prefix text NOT NULL,
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);

-- Create api_requests table
CREATE TABLE IF NOT EXISTS api_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL,
  target_url text NOT NULL,
  method text DEFAULT 'GET',
  request_data jsonb DEFAULT '{}',
  response_data jsonb DEFAULT '{}',
  status_code integer,
  duration_ms integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API requests"
  ON api_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API requests"
  ON api_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for api_requests
CREATE INDEX IF NOT EXISTS idx_api_requests_user_id ON api_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_created_at ON api_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_requests_user_created ON api_requests(user_id, created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();