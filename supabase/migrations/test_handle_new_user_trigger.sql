-- Test del trigger handle_new_user

-- Prima verifichiamo se il trigger esiste
DO $$
BEGIN
    -- Controlla se il trigger esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'handle_new_user' 
        AND event_object_table = 'users'
        AND event_object_schema = 'auth'
    ) THEN
        RAISE NOTICE 'ERRORE: Il trigger handle_new_user NON esiste!';
    ELSE
        RAISE NOTICE 'OK: Il trigger handle_new_user esiste';
    END IF;
END $$;

-- Verifichiamo se la funzione handle_new_user esiste
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'handle_new_user' 
        AND routine_schema = 'public'
    ) THEN
        RAISE NOTICE 'ERRORE: La funzione handle_new_user NON esiste!';
    ELSE
        RAISE NOTICE 'OK: La funzione handle_new_user esiste';
    END IF;
END $$;

-- Mostriamo la definizione della funzione se esiste
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- Mostriamo i dettagli del trigger se esiste
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers 
WHERE trigger_name = 'handle_new_user';

-- Verifichiamo i permessi sulla tabella user
SELECT 
    'Permessi tabella user:' as info,
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'user' 
AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;