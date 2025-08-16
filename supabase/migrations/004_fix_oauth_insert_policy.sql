-- Fix OAuth user creation by updating INSERT policy
-- The current policy requires auth.uid() = id, but during OAuth signup
-- Supabase needs to create the user record first before auth.uid() is available

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create a new INSERT policy that allows OAuth user creation
-- This allows authenticated sessions to insert user records
CREATE POLICY "Allow OAuth user creation" ON public.users
    FOR INSERT WITH CHECK (true);

-- Ensure authenticated role has INSERT permission
GRANT INSERT ON public.users TO authenticated;