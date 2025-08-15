-- RESET COMPLETO DATABASE
-- Questo script elimina tutte le tabelle personalizzate e i loro constraint

-- Disabilita temporaneamente i trigger per evitare errori durante l'eliminazione
SET session_replication_role = replica;

-- Elimina tutte le policy RLS esistenti
DROP POLICY IF EXISTS "Users can view own profile" ON public.user;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user;
DROP POLICY IF EXISTS "Users can view own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can update own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can manage workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can view own usage" ON public.user_usage;
DROP POLICY IF EXISTS "Users can update own usage" ON public.user_usage;
DROP POLICY IF EXISTS "Users can view workspace usage" ON public.workspace_usage;
DROP POLICY IF EXISTS "Users can update workspace usage" ON public.workspace_usage;

-- Elimina tutti i trigger esistenti
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS handle_updated_at ON public.user;
DROP TRIGGER IF EXISTS handle_updated_at ON public.workspaces;
DROP TRIGGER IF EXISTS handle_updated_at ON public.workspace_members;
DROP TRIGGER IF EXISTS handle_updated_at ON public.user_usage;
DROP TRIGGER IF EXISTS handle_updated_at ON public.workspace_usage;

-- Elimina tutte le funzioni personalizzate
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_usage() CASCADE;
DROP FUNCTION IF EXISTS public.create_workspace_usage() CASCADE;

-- Elimina le tabelle in ordine corretto (rispettando le dipendenze)
DROP TABLE IF EXISTS public.workspace_usage CASCADE;
DROP TABLE IF EXISTS public.user_usage CASCADE;
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP TABLE IF EXISTS public.user CASCADE;

-- Riabilita i trigger
SET session_replication_role = DEFAULT;

-- Verifica che tutte le tabelle siano state eliminate
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns');

-- Log del reset
-- Database reset completato. Tutte le tabelle personalizzate sono state eliminate.