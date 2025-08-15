-- Test diretto del trigger handle_new_user

-- 1. Prima verifichiamo se il trigger esiste davvero
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'handle_new_user' 
        AND event_object_schema = 'auth'
        AND event_object_table = 'users'
    ) THEN
        RAISE NOTICE 'ERRORE: Il trigger handle_new_user NON ESISTE!';
    ELSE
        RAISE NOTICE 'OK: Il trigger handle_new_user esiste';
    END IF;
END $$;

-- 2. Verifichiamo se la funzione handle_new_user esiste
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'handle_new_user'
        AND routine_schema = 'public'
    ) THEN
        RAISE NOTICE 'ERRORE: La funzione handle_new_user NON ESISTE!';
    ELSE
        RAISE NOTICE 'OK: La funzione handle_new_user esiste';
    END IF;
END $$;

-- 3. Verifichiamo i permessi sulla tabella user
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'ERRORE: Nessun permesso trovato per anon/authenticated'
        ELSE 'OK: Permessi trovati per ' || string_agg(grantee || ':' || privilege_type, ', ')
    END as permission_status
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'user'
AND grantee IN ('anon', 'authenticated');

-- 4. Test della funzione check_trigger_exists
SELECT 
    CASE 
        WHEN public.check_trigger_exists('handle_new_user') THEN 'OK: check_trigger_exists funziona'
        ELSE 'ERRORE: check_trigger_exists non trova il trigger'
    END as function_test;

-- 5. Mostriamo la definizione del trigger se esiste
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'handle_new_user';