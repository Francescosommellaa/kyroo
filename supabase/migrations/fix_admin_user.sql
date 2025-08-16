-- Inserisce manualmente l'utente admin nella tabella public.user se non esiste
-- Prima verifica se l'utente esiste in auth.users
DO $$
DECLARE
    auth_user_id uuid;
    auth_user_email text;
BEGIN
    -- Trova l'utente in auth.users
    SELECT id, email INTO auth_user_id, auth_user_email
    FROM auth.users 
    WHERE email = 'Francescosommellaa@gmail.com';
    
    IF auth_user_id IS NOT NULL THEN
        -- Inserisce l'utente nella tabella public.user se non esiste già
        INSERT INTO public.user (
            id,
            email,
            full_name,
            display_name,
            email_verified,
            provider,
            created_at,
            updated_at
        )
        SELECT 
            auth_user_id,
            auth_user_email,
            'Administrator',
            'Administrator',
            true,
            'email',
            NOW(),
            NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM public.user WHERE id = auth_user_id
        );
        
        RAISE NOTICE 'Utente admin inserito/verificato nella tabella public.user con ID: %', auth_user_id;
    ELSE
        RAISE NOTICE 'Utente non trovato in auth.users con email: Francescosommellaa@gmail.com';
    END IF;
END $$;

-- Verifica il risultato
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.display_name,
    u.email_verified,
    u.provider,
    u.created_at
FROM public.user u
WHERE u.email = 'Francescosommellaa@gmail.com';