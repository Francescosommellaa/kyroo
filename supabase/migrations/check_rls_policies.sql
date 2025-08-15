-- Controlla le policy RLS per la tabella user

-- 1. Verifica se RLS è abilitato sulla tabella user
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'user';

-- 2. Mostra tutte le policy RLS sulla tabella user
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
WHERE schemaname = 'public' AND tablename = 'user'
ORDER BY policyname;

-- 3. Verifica i permessi sulla tabella user per i ruoli anon e authenticated
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'user' 
    AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 4. Verifica i permessi sulla tabella user_roles
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'user_roles' 
    AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 5. Test di inserimento simulato (solo per verificare la sintassi)
EXPLAIN (FORMAT TEXT) 
INSERT INTO public.user (
    id,
    email,
    full_name,
    display_name,
    provider,
    email_verified,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'test@example.com',
    'Test User',
    'Test User',
    'email',
    false,
    NOW(),
    NOW()
);