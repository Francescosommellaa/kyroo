-- Verifica finale e assegnazione ruolo admin
-- Prima verifica se l'utente esiste e ha il ruolo corretto
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.display_name,
    u.email_verified,
    u.provider,
    u.created_at,
    'Ruolo non ancora assegnato' as current_role
FROM public.user u
WHERE u.email = 'Francescosommellaa@gmail.com';

-- Aggiunge la colonna role se non esiste
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user ADD COLUMN role text DEFAULT 'user';
        RAISE NOTICE 'Colonna role aggiunta alla tabella user';
    END IF;
END $$;

-- Aggiorna il ruolo dell'utente admin
UPDATE public.user 
SET role = 'admin'
WHERE email = 'Francescosommellaa@gmail.com';

-- Verifica finale
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.display_name,
    u.email_verified,
    u.provider,
    u.role,
    u.created_at
FROM public.user u
WHERE u.email = 'Francescosommellaa@gmail.com';

-- Conta tutti gli utenti per conferma
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users
FROM public.user;