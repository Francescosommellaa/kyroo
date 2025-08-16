-- Simple policy fix for authentication issues
-- This migration fixes the existing policies without conflicts

-- =====================================================
-- STEP 1: Drop ALL existing policies completely
-- =====================================================

-- Drop all INSERT policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow OAuth user creation" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "unified_users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "comprehensive_users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;

-- Drop all SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;

-- Drop all UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;

-- Drop all DELETE policies
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;
DROP POLICY IF EXISTS "users_delete_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;

-- =====================================================
-- STEP 2: Drop existing triggers and functions
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- =====================================================
-- STEP 3: Create new, clean policies
-- =====================================================

-- INSERT: Allow users to create profiles
CREATE POLICY "allow_user_insert" ON public.users
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR
    auth.role() = 'authenticated' OR
    auth.role() = 'service_role'
  );

-- SELECT: Allow users to read their own data
CREATE POLICY "allow_user_select" ON public.users
  FOR SELECT
  USING (
    auth.uid() = id OR
    auth.role() = 'service_role'
  );

-- UPDATE: Allow users to update their own data
CREATE POLICY "allow_user_update" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: Allow users to delete their own data
CREATE POLICY "allow_user_delete" ON public.users
  FOR DELETE
  USING (
    auth.uid() = id OR
    auth.role() = 'service_role'
  );

-- =====================================================
-- STEP 4: Grant permissions
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT ON public.users TO anon;
GRANT ALL PRIVILEGES ON public.users TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;

-- =====================================================
-- STEP 5: Create OAuth trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    display_name,
    avatar_url,
    role,
    plan,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    'user',
    'free',
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role, postgres, authenticated;

-- =====================================================
-- STEP 6: Ensure RLS is enabled
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 008_simple_policy_fix completed successfully';
  RAISE NOTICE 'Authentication policies and triggers are now properly configured';
END $$;