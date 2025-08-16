-- Fix OAuth user creation by improving RLS policies and permissions
-- This resolves the 'Database error saving new user' OAuth error

-- Drop existing restrictive INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create a more permissive INSERT policy for OAuth users
CREATE POLICY "Allow OAuth user creation" ON public.users
  FOR INSERT
  WITH CHECK (
    -- Allow insert if the user ID matches the authenticated user
    auth.uid() = id
    OR
    -- Allow insert during OAuth flow (when user might not be fully authenticated yet)
    auth.role() = 'authenticated'
  );

-- Ensure service_role can always insert users (for OAuth flows)
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Grant additional permissions to authenticated role for OAuth
GRANT INSERT ON public.users TO authenticated;
GRANT INSERT ON public.users TO anon;

-- Ensure users table has proper default values in schema
-- (This should already be set in the table definition, but ensuring it's explicit)
ALTER TABLE public.users 
  ALTER COLUMN role SET DEFAULT 'user',
  ALTER COLUMN plan SET DEFAULT 'free',
  ALTER COLUMN email_verified SET DEFAULT false,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile when new auth user is created via OAuth with proper default values';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Triggers user profile creation for OAuth users with default plan=free, role=user';