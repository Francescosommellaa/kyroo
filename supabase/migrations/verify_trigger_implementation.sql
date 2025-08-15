-- Verifica che il trigger handle_new_user sia correttamente implementato

-- 1. Verifica che i trigger esistano
SELECT 
    'Trigger Status' as check_type,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_updated', 'handle_updated_at')
ORDER BY trigger_name;

-- 2. Verifica che le funzioni esistano
SELECT 
    'Function Status' as check_type,
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'handle_updated_at', 'check_trigger_exists', 'check_function_exists')
AND routine_schema = 'public'
ORDER BY routine_name;

-- 3. Test delle funzioni helper
SELECT 
    'Helper Functions Test' as check_type,
    'check_trigger_exists(on_auth_user_created)' as test_name,
    public.check_trigger_exists('on_auth_user_created') as result;

SELECT 
    'Helper Functions Test' as check_type,
    'check_function_exists(handle_new_user)' as test_name,
    public.check_function_exists('handle_new_user') as result;

-- 4. Verifica la struttura della tabella user
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verifica i permessi sulla tabella user
SELECT 
    'Permissions Check' as check_type,
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'user'
AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;