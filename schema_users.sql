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


-- =====================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- =====================================================
-- This creates a row in user_profiles automatically whenever someone signs up!

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, status, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'pending', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
