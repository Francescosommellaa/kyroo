/*
  # Add usage tracking system

  1. New Tables
    - `user_usage` - Track user-level usage metrics
    - `workspace_usage` - Track workspace-level usage metrics

  2. Updates to existing tables
    - Add trial tracking to profiles

  3. Functions
    - Reset daily counters function
    - Reset monthly counters function
*/

-- Add trial tracking to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_start_date timestamptz,
ADD COLUMN IF NOT EXISTS trial_used boolean DEFAULT false;

-- Create user_usage table
CREATE TABLE IF NOT EXISTS user_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Global metrics
  total_workspaces integer DEFAULT 0,
  web_searches_today integer DEFAULT 0,
  
  -- Reset tracking
  last_daily_reset date DEFAULT CURRENT_DATE,
  monthly_reset_date timestamptz DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create workspace_usage table
CREATE TABLE IF NOT EXISTS workspace_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Workspace metrics
  active_chats_count integer DEFAULT 0,
  collaborators_count integer DEFAULT 0,
  active_workflows_count integer DEFAULT 0,
  knowledge_base_size_gb numeric(10,2) DEFAULT 0,
  
  -- Daily metrics (reset at 00:00 Europe/Rome)
  workflow_executions_today integer DEFAULT 0,
  
  -- Monthly metrics
  files_this_month integer DEFAULT 0,
  web_agent_runs_this_month integer DEFAULT 0,
  
  -- Reset tracking
  last_daily_reset date DEFAULT CURRENT_DATE,
  monthly_reset_date timestamptz DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(workspace_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_daily_reset ON user_usage(last_daily_reset);
CREATE INDEX IF NOT EXISTS idx_workspace_usage_workspace_id ON workspace_usage(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_usage_user_id ON workspace_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_usage_daily_reset ON workspace_usage(last_daily_reset);

-- Function to reset daily counters (called by cron job)
CREATE OR REPLACE FUNCTION reset_daily_usage_counters()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Reset user daily counters
  UPDATE user_usage 
  SET 
    web_searches_today = 0,
    last_daily_reset = CURRENT_DATE,
    updated_at = now()
  WHERE last_daily_reset < CURRENT_DATE;
  
  -- Reset workspace daily counters
  UPDATE workspace_usage 
  SET 
    workflow_executions_today = 0,
    last_daily_reset = CURRENT_DATE,
    updated_at = now()
  WHERE last_daily_reset < CURRENT_DATE;
END;
$$;

-- Function to reset monthly counters
CREATE OR REPLACE FUNCTION reset_monthly_usage_counters()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Reset workspace monthly counters
  UPDATE workspace_usage 
  SET 
    files_this_month = 0,
    web_agent_runs_this_month = 0,
    monthly_reset_date = monthly_reset_date + INTERVAL '1 month',
    updated_at = now()
  WHERE monthly_reset_date <= now();
END;
$$;

-- Function to initialize user usage when user is created
CREATE OR REPLACE FUNCTION initialize_user_usage()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_usage (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to initialize usage when profile is created
CREATE OR REPLACE TRIGGER trigger_initialize_user_usage
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_usage();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER trigger_user_usage_updated_at
  BEFORE UPDATE ON user_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_workspace_usage_updated_at
  BEFORE UPDATE ON workspace_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_usage
CREATE POLICY "Users can view own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON user_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all usage" ON user_usage
  FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for workspace_usage
CREATE POLICY "Users can view own workspace usage" ON workspace_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own workspace usage" ON workspace_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all workspace usage" ON workspace_usage
  FOR ALL USING (auth.role() = 'service_role');

-- Initialize usage for existing users
INSERT INTO user_usage (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE user_usage IS 'Tracks user-level usage metrics and limits';
COMMENT ON TABLE workspace_usage IS 'Tracks workspace-level usage metrics and limits';
COMMENT ON COLUMN profiles.trial_start_date IS 'When the user started their Pro trial';
COMMENT ON COLUMN profiles.trial_used IS 'Whether the user has used their one-time Pro trial';

