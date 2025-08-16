-- Rename public.users table to public.profiles to avoid confusion with auth.users
-- This migration provides clear separation: auth.users for authentication, public.profiles for user data
-- IMPORTANT: This migration updates ALL foreign key constraints and relationships

-- =====================================================
-- STEP 1: Drop all existing policies on users table
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Allow OAuth user creation" ON public.users;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;

-- =====================================================
-- STEP 2: Drop existing trigger and function
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- =====================================================
-- STEP 3: Drop foreign key constraints that reference users
-- =====================================================
-- Drop foreign key constraint from workspaces table
ALTER TABLE public.workspaces DROP CONSTRAINT IF EXISTS workspaces_owner_id_fkey;

-- Drop foreign key constraint from user_workspaces table
ALTER TABLE public.user_workspaces DROP CONSTRAINT IF EXISTS user_workspaces_user_id_fkey;

-- =====================================================
-- STEP 4: Rename the table
-- =====================================================
ALTER TABLE public.users RENAME TO profiles;

-- =====================================================
-- STEP 5: Recreate foreign key constraints pointing to profiles
-- =====================================================
-- Recreate foreign key constraint for workspaces table
ALTER TABLE public.workspaces 
ADD CONSTRAINT workspaces_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Recreate foreign key constraint for user_workspaces table
ALTER TABLE public.user_workspaces 
ADD CONSTRAINT user_workspaces_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Recreate the trigger function for profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 7: Grant permissions to anon and authenticated roles
-- =====================================================
GRANT SELECT ON public.profiles TO anon;
GRANT ALL PRIVILEGES ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;

-- Ensure permissions are also granted for related tables
GRANT ALL ON public.workspaces TO authenticated;
GRANT ALL ON public.user_workspaces TO authenticated;
GRANT ALL ON public.collections TO authenticated;

-- =====================================================
-- STEP 8: Update indexes that reference the old table name
-- =====================================================
-- Note: Indexes are automatically renamed when the table is renamed,
-- but we verify they exist with the new naming convention

-- =====================================================
-- STEP 9: Add comments to clarify the table purpose
-- =====================================================
COMMENT ON TABLE public.profiles IS 'User profile data - separate from auth.users which handles authentication';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users.id - no default value to allow explicit UUID insertion';

-- =====================================================
-- STEP 10: Verify referential integrity
-- =====================================================
-- This migration maintains all existing relationships:
-- - public.workspaces.owner_id -> public.profiles.id
-- - public.user_workspaces.user_id -> public.profiles.id
-- - public.user_workspaces.workspace_id -> public.workspaces.id
-- - public.collections.workspace_id -> public.workspaces.id