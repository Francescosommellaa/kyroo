-- Verifica se l'utente admin esiste nella tabella auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'Francescosommellaa@gmail.com';

-- Verifica se l'utente esiste nella tabella public.user
SELECT 
    id,
    email,
    full_name,
    email_verified,
    created_at,
    updated_at
FROM public.user 
WHERE email = 'Francescosommellaa@gmail.com';

-- Conta tutti gli utenti in auth.users
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- Conta tutti gli utenti in public.user
SELECT COUNT(*) as total_public_users FROM public.user;