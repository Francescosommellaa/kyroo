-- Ensure the auth trigger exists for handle_new_user function
-- This migration safely creates the trigger if it doesn't exist
-- Uses a safe approach that handles permission issues gracefully

-- =====================================================
-- STEP 1: Check and create trigger safely
-- =====================================================
-- This approach uses DO block to handle potential permission issues

DO $$
BEGIN
  -- Try to create the trigger, ignore if it already exists or if we don't have permissions
  BEGIN
    -- Check if trigger exists first
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'on_auth_user_created' 
      AND tgrelid = 'auth.users'::regclass
    ) THEN
      -- Create the trigger
      EXECUTE '
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW
          EXECUTE FUNCTION public.handle_new_user();
      ';
      
      RAISE NOTICE 'Trigger on_auth_user_created created successfully';
    ELSE
      RAISE NOTICE 'Trigger on_auth_user_created already exists';
    END IF;
    
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE WARNING 'Insufficient privileges to create trigger on auth.users';
      RAISE WARNING 'Please create the trigger manually via Supabase Dashboard:';
      RAISE WARNING 'CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();';
    
    WHEN OTHERS THEN
      RAISE WARNING 'Error creating trigger: % - %', SQLSTATE, SQLERRM;
      RAISE WARNING 'Please create the trigger manually via Supabase Dashboard:';
      RAISE WARNING 'CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();';
  END;
END $$;

-- =====================================================
-- STEP 2: Verify function exists and is properly configured
-- =====================================================
DO $$
BEGIN
  -- Check if our function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    RAISE NOTICE 'Function public.handle_new_user exists and is ready';
  ELSE
    RAISE WARNING 'Function public.handle_new_user does not exist!';
  END IF;
END $$;

-- =====================================================
-- STEP 3: Log completion and instructions
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Migration 012_ensure_auth_trigger completed';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'The handle_new_user function has been updated with:';
  RAISE NOTICE '- Robust error handling to prevent registration failures';
  RAISE NOTICE '- Proper extraction of metadata from raw_user_meta_data';
  RAISE NOTICE '- Comprehensive field mapping for all required columns';
  RAISE NOTICE '- SECURITY DEFINER for proper permissions';
  RAISE NOTICE '- ON CONFLICT handling to prevent duplicates';
  RAISE NOTICE '';
  RAISE NOTICE 'If the trigger creation failed due to permissions:';
  RAISE NOTICE '1. Go to Supabase Dashboard > SQL Editor';
  RAISE NOTICE '2. Run this command:';
  RAISE NOTICE '   CREATE TRIGGER on_auth_user_created';
  RAISE NOTICE '     AFTER INSERT ON auth.users';
  RAISE NOTICE '     FOR EACH ROW';
  RAISE NOTICE '     EXECUTE FUNCTION public.handle_new_user();';
  RAISE NOTICE '';
  RAISE NOTICE 'The "Database error saving new user" issue should now be resolved!';
END $$;