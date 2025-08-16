-- Complete authentication reset and fix
-- This migration completely resets all RLS policies and creates a clean, working setup

-- =====================================================
-- STEP 1: Drop ALL existing policies to start fresh
-- =====================================================

-- Drop all possible INSERT policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow OAuth user creation" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "unified_users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "comprehensive_users_insert_policy" ON public.users;

-- Drop all possible SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;

-- Drop all possible UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;

-- Drop all possible DELETE policies
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;
DROP POLICY IF EXISTS "users_delete_own_profile" ON public.users;

-- =====================================================
-- STEP 2: Drop existing trigger and function properly
-- =====================================================

-- Drop trigger first, then function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- =====================================================
-- STEP 3: Create clean, working RLS policies
-- =====================================================

-- INSERT policy: Allow users to create their own profile and OAuth creation
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT
  WITH CHECK (
    -- Normal registration: user can insert their own profile
    auth.uid() = id
    OR
    -- OAuth registration: allow authenticated users to insert
    (auth.role() = 'authenticated' AND auth.uid() IS NOT NULL)
    OR
    -- Admin operations: service role can insert any user
    auth.role() = 'service_role'
  );

-- SELECT policy: Users can read their own profile
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT
  USING (
    auth.uid() = id
    OR
    auth.role() = 'service_role'
  );

-- UPDATE policy: Users can update their own profile
CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE policy: Users can delete their own profile
CREATE POLICY "users_delete_policy" ON public.users
  FOR DELETE
  USING (
    auth.uid() = id
    OR
    auth.role() = 'service_role'
  );

-- =====================================================
-- STEP 4: Ensure proper permissions
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant full permissions to service role
GRANT ALL PRIVILEGES ON public.users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant permissions to anon role for OAuth
GRANT SELECT, INSERT ON public.users TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- =====================================================
-- STEP 5: Ensure RLS is enabled
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: Create the trigger function for OAuth
-- =====================================================

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- Insert new user profile with default values
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
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate inserts
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- =====================================================
-- STEP 7: Add helpful comments
-- =====================================================

COMMENT ON POLICY "users_insert_policy" ON public.users IS 
  'Allows user profile creation for normal registration, OAuth, and admin operations';
COMMENT ON POLICY "users_select_policy" ON public.users IS 
  'Allows users to read their own profile data';
COMMENT ON POLICY "users_update_policy" ON public.users IS 
  'Allows users to update their own profile data';
COMMENT ON POLICY "users_delete_policy" ON public.users IS 
  'Allows users to delete their own profile data';
COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates user profile when new auth user is created via OAuth or email signup';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
  'Triggers user profile creation for all new users with error handling';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 007_complete_auth_reset completed successfully';
  RAISE NOTICE 'All RLS policies reset and OAuth trigger recreated';
END $$;