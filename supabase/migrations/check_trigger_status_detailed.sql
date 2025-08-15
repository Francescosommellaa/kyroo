-- Verifica dettagliata dello stato del trigger handle_new_user
-- Controlla esistenza, definizione e funzionamento del trigger

-- 1. Verifica esistenza del trigger
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.event_object_table,
    t.action_timing,
    t.action_statement,
    t.trigger_schema
FROM information_schema.triggers t
WHERE t.trigger_name = 'handle_new_user'
    AND t.event_object_table = 'users'
    AND t.trigger_schema = 'auth';

-- 2. Verifica esistenza della funzione
SELECT 
    p.proname as function_name,
    p.prosrc as function_body,
    n.nspname as schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user'
    AND n.nspname = 'public';

-- 3. Verifica permessi sulla tabella user
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
    AND table_name = 'user'
    AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee;

-- 4. Verifica policy RLS sulla tabella user
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'user';

-- 5. Verifica se RLS è abilitato
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename = 'user';

-- 6. Verifica funzioni helper esistenti
SELECT 
    p.proname as function_name,
    n.nspname as schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('check_trigger_exists', 'check_function_exists')
    AND n.nspname = 'public';

-- 7. Verifica completata
SELECT 
    'Verifica trigger completata' as status,
    now() as timestamp;