-- Verifica l'esistenza e il funzionamento del trigger handle_new_user

-- 1. Verifica se il trigger esiste
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'handle_new_user'
AND event_object_schema = 'auth';

-- 2. Verifica se la funzione handle_new_user esiste
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 3. Verifica la struttura della tabella user
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verifica i permessi sulla tabella user
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'user'
AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 5. Test della funzione check_trigger_exists corretta
SELECT public.check_trigger_exists('handle_new_user') as trigger_exists;