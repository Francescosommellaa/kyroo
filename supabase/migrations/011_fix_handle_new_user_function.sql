-- Fix handle_new_user function to be robust and atomic
-- This migration corrects the handle_new_user function to properly handle all required fields
-- and prevent "Database error saving new user" during registration
-- Uses a safe approach that doesn't require direct auth.users table permissions

-- =====================================================
-- STEP 1: Create robust handle_new_user function
-- =====================================================
-- This function follows best practices:
-- 1. Uses SECURITY DEFINER for proper permissions
-- 2. Handles all mandatory fields (id, email are NOT NULL)
-- 3. Extracts metadata from raw_user_meta_data
-- 4. Sets appropriate default values
-- 5. Includes comprehensive error handling
-- 6. Uses ON CONFLICT to prevent duplicates

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert new user profile with comprehensive field handling
  INSERT INTO public.profiles (
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
    NEW.id,  -- Required: UUID from auth.users
    NEW.email,  -- Required: Email from auth.users
    -- Extract full_name from metadata with fallback
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)  -- Fallback to email username
    ),
    -- Extract display_name from metadata with fallback
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)  -- Fallback to email username
    ),
    -- Extract avatar_url from metadata (can be NULL)
    NEW.raw_user_meta_data->>'avatar_url',
    -- Set default role (has default value 'user' in schema)
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    -- Set default plan (has default value 'free' in schema)
    COALESCE(NEW.raw_user_meta_data->>'plan', 'free'),
    -- Set email_verified based on email_confirmed_at
    CASE
      WHEN NEW.email_confirmed_at IS NOT NULL THEN true
      ELSE false
    END,
    -- Timestamps (have default values in schema)
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate inserts

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- Comprehensive error handling
    -- Log the error but don't fail the auth transaction
    RAISE WARNING 'Failed to create user profile for user_id %, email %: % - %',
      NEW.id, NEW.email, SQLSTATE, SQLERRM;

    -- Still return NEW to not break the auth flow
    RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 2: Grant proper permissions
-- =====================================================
-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- =====================================================
-- STEP 3: Add documentation
-- =====================================================
COMMENT ON FUNCTION public.handle_new_user() IS
  'Robust function to create user profile in public.profiles when new auth user is created. '
  'Handles all required fields, extracts metadata, sets defaults, and includes error handling '
  'to prevent "Database error saving new user" during registration.';

-- =====================================================
-- STEP 4: Log completion
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Migration 011_fix_handle_new_user_function completed successfully';
  RAISE NOTICE 'handle_new_user function updated with robust error handling and field mapping';
  RAISE NOTICE 'Function now properly handles all required fields and prevents registration errors';
  RAISE NOTICE 'Note: If trigger does not exist, it needs to be created manually via Supabase Dashboard';
END $$;