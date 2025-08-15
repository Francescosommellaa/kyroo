-- Test diretto di inserimento utente per verificare il trigger

-- 1. Prima verifichiamo che i trigger esistano
SELECT 
    'Trigger trovati: ' || string_agg(trigger_name, ', ') as trigger_status
FROM information_schema.triggers 
WHERE trigger_name LIKE '%handle_new_user%'
AND event_object_schema = 'auth';

-- 2. Verifichiamo la funzione check_trigger_exists
SELECT 
    CASE 
        WHEN public.check_trigger_exists('handle_new_user_insert') THEN 'OK: Trigger INSERT trovato'
        ELSE 'ERRORE: Trigger INSERT non trovato'
    END as insert_trigger_test;

-- 3. Verifichiamo i permessi sulla tabella user
SELECT 
    grantee,
    string_agg(privilege_type, ', ') as privileges
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'user'
AND grantee IN ('anon', 'authenticated')
GROUP BY grantee;

-- 4. Test di inserimento diretto nella tabella user (simulando il trigger)
-- Questo ci aiuta a capire se il problema è nel trigger o nei permessi
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
    test_email text := 'test_' || extract(epoch from now()) || '@example.com';
BEGIN
    -- Prova a inserire direttamente nella tabella user
    INSERT INTO public.user (
        id,
        email,
        full_name,
        avatar_url,
        provider,
        email_verified,
        created_at,
        updated_at
    )
    VALUES (
        test_id,
        test_email,
        'Test User',
        '',
        'email',
        false,
        now(),
        now()
    );
    
    RAISE NOTICE 'SUCCESS: Inserimento diretto nella tabella user riuscito per %', test_email;
    
    -- Pulisce il test
    DELETE FROM public.user WHERE id = test_id;
    RAISE NOTICE 'Test cleanup completato';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRORE nell inserimento diretto: % %', SQLERRM, SQLSTATE;
END;
$$;

-- 5. Verifica che la tabella user sia accessibile
SELECT 
    COUNT(*) as total_users,
    'Tabella user accessibile' as status
FROM public.user;