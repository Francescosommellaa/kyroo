/*
  # Add user plans system

  1. Changes to profiles table
    - Add `plan` column (text, default 'free')
    - Add `plan_expires_at` column (timestamptz, nullable)
    - Add check constraint for valid plans

  2. Update existing users
    - Set all existing users to 'free' plan
*/

-- Add plan column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise'));

-- Add plan expiration column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

-- Update existing users to have free plan
UPDATE profiles SET plan = 'free' WHERE plan IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.plan IS 'User subscription plan: free, pro, or enterprise';
COMMENT ON COLUMN profiles.plan_expires_at IS 'When the current paid plan expires (null for free plan)';

