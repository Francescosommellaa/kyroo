-- Verifica dettagliata dello stato dei trigger

-- 1. Controlla se il trigger handle_new_user esiste
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers 
WHERE trigger_name = 'handle_new_user';

-- 2. Controlla tutte le funzioni che iniziano con handle_new_user
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE 'handle_new_user%' 
AND routine_schema = 'public';

-- 3. Verifica le policy RLS sulla tabella user
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
WHERE tablename = 'user';

-- 4. Controlla i permessi sulla tabella user
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'user' 
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

-- 5. Verifica se esistono le funzioni helper
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('check_trigger_exists', 'check_function_exists')
AND routine_schema = 'public';