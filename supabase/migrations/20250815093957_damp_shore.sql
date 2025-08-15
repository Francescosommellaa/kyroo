/*
  # Fix user signup database error

  This migration creates the necessary function and trigger to automatically
  create a user profile in the public.user table when a new user signs up
  through Supabase Auth.

  1. Database Function
     - `handle_new_user()` - Creates a profile entry in public.user table
     - Extracts user data from auth.users and inserts into public.user
     - Sets default values for role ('user') and plan ('free')

  2. Database Trigger
     - `on_auth_user_created` - Automatically executes after user signup
     - Calls handle_new_user() function for each new auth.users record

  This resolves the "Database error saving new user" error during signup.
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user (id, email, display_name, role, plan)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), 
    'user', 
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically call handle_new_user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();