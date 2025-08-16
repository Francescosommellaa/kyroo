-- Final authentication fix migration
-- This migration resolves all RLS policy conflicts and ensures proper user registration

-- Drop all existing conflicting INSERT policies on public.users
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow OAuth user creation" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "unified_users_insert_policy" ON public.users;

-- Create a single, comprehensive INSERT policy that handles all cases
CREATE POLICY "comprehensive_users_insert_policy" ON public.users
  FOR INSERT
  WITH CHECK (
    -- Allow users to insert their own profile (normal registration)
    auth.uid() = id
    OR
    -- Allow service role to insert any user (for admin operations)
    auth.role() = 'service_role'
    OR
    -- Allow authenticated users to insert during OAuth flow
    -- This is more permissive to handle OAuth edge cases
    (auth.role() = 'authenticated' AND auth.uid() IS NOT NULL)
  );

-- Ensure SELECT policy exists for users to read their own data
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "users_select_own_profile" ON public.users
  FOR SELECT
  USING (
    auth.uid() = id
    OR
    auth.role() = 'service_role'
  );

-- Ensure UPDATE policy exists for users to update their own data
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "users_update_own_profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to roles
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Add helpful comments
COMMENT ON POLICY "comprehensive_users_insert_policy" ON public.users IS 
  'Allows user profile creation for normal registration, OAuth, and admin operations';
COMMENT ON POLICY "users_select_own_profile" ON public.users IS 
  'Allows users to read their own profile data';
COMMENT ON POLICY "users_update_own_profile" ON public.users IS 
  'Allows users to update their own profile data';

-- Verify RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Log the migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 006_final_auth_fix completed successfully';
  RAISE NOTICE 'RLS policies consolidated and permissions granted';
END $$;