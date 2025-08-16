-- Fix users table ID column to allow explicit UUID insertion
-- This migration removes the DEFAULT gen_random_uuid() from the id column
-- to prevent conflicts when inserting specific UUIDs from auth.users

-- =====================================================
-- STEP 1: Remove the DEFAULT constraint from id column
-- =====================================================

-- Remove the default value from the id column
-- This allows explicit UUID insertion from auth.users
ALTER TABLE public.users 
ALTER COLUMN id DROP DEFAULT;

-- =====================================================
-- STEP 2: Verify column constraints remain intact
-- =====================================================

-- Ensure the column is still NOT NULL and PRIMARY KEY
-- (These constraints should remain unchanged)
ALTER TABLE public.users 
ALTER COLUMN id SET NOT NULL;

-- The PRIMARY KEY constraint should already exist
-- but we'll ensure it's there (this will be ignored if it exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' 
        AND constraint_type = 'PRIMARY KEY'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD PRIMARY KEY (id);
    END IF;
END $$;

-- =====================================================
-- STEP 3: Add helpful comments
-- =====================================================

COMMENT ON COLUMN public.users.id IS 
  'User ID from auth.users - no default value to allow explicit UUID insertion';

-- =====================================================
-- STEP 4: Log completion
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 009_fix_users_id_column completed successfully';
  RAISE NOTICE 'Removed DEFAULT gen_random_uuid() from users.id column';
  RAISE NOTICE 'Column now accepts explicit UUID values from auth.users';
END $$;