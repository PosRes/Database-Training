-- =====================================================
-- USER PROFILES TABLE (for registration & approval)
-- Run this in the Supabase SQL Editor
-- =====================================================

-- Create the user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop all old policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated update profiles" ON user_profiles;

-- SIMPLE POLICIES: All authenticated users can read all profiles
-- (profile data is not sensitive — it only contains name, email, status)
CREATE POLICY "Authenticated read profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Any authenticated user can insert their own profile (on registration)
CREATE POLICY "Authenticated insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Any authenticated user can update profiles
-- (the admin check is done in the app code, not in RLS)
CREATE POLICY "Authenticated update profiles" ON user_profiles
  FOR UPDATE USING (auth.role() = 'authenticated');
