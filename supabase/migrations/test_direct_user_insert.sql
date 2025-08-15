-- Test diretto di inserimento nella tabella user
-- Identifica problemi specifici con l'inserimento di nuovi utenti

-- 1. Test inserimento con dati minimi
DO $$
BEGIN
    -- Prova inserimento diretto
    BEGIN
        INSERT INTO public.user (id, email, full_name, display_name)
        VALUES (
            gen_random_uuid(),
            'test@example.com',
            'Test User',
            'Test User'
        );
        
        RAISE NOTICE 'Inserimento diretto riuscito';
        
        -- Rimuovi il record di test
        DELETE FROM public.user WHERE email = 'test@example.com';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Errore inserimento diretto: %', SQLERRM;
    END;
END $$;

-- 2. Test inserimento simulando il trigger
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    test_email text := 'trigger_test@example.com';
BEGIN
    -- Simula inserimento in auth.users
    BEGIN
        -- Prova a chiamare direttamente la funzione handle_new_user
        IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
            RAISE NOTICE 'Funzione handle_new_user trovata';
            
            -- Test inserimento nella tabella user
            INSERT INTO public.user (
                id,
                email,
                full_name,
                display_name,
                provider,
                email_verified
            ) VALUES (
                test_user_id,
                test_email,
                'Trigger Test User',
                'Trigger Test User',
                'email',
                false
            );
            
            RAISE NOTICE 'Inserimento tramite trigger simulato riuscito';
            
            -- Cleanup
            DELETE FROM public.user WHERE email = test_email;
            
        ELSE
            RAISE NOTICE 'Funzione handle_new_user NON trovata';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Errore inserimento tramite trigger: %', SQLERRM;
    END;
END $$;

-- 3. Verifica permessi attuali
SELECT 
    'Permessi verificati' as status,
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
    AND table_name = 'user'
    AND grantee IN ('anon', 'authenticated', 'service_role');

-- 4. Test finale
SELECT 
    'Test inserimento completato' as status,
    now() as timestamp;