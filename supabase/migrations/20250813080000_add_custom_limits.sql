/*
  # Add custom limits for Enterprise users

  1. Changes to profiles table
    - Add `custom_limits` column (jsonb, nullable)
    - This will store custom plan limits for Enterprise users

  2. Comments
    - Add documentation for the new column
*/

-- Add custom_limits column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS custom_limits jsonb;

-- Add comment for documentation
COMMENT ON COLUMN profiles.custom_limits IS 'Custom plan limits for Enterprise users (JSON format)';

-- Create index for better performance when querying custom limits
CREATE INDEX IF NOT EXISTS idx_profiles_custom_limits ON profiles USING gin (custom_limits);
