-- Risolve il problema di accesso non autorizzato
-- Rimuove i permessi per utenti anonimi e rafforza la sicurezza

-- 1. Rimuove i permessi per utenti anonimi sulla tabella user
REVOKE ALL ON public.user FROM anon;

-- 2. Rimuove i permessi per utenti anonimi sulla tabella user_roles
REVOKE ALL ON public.user_roles FROM anon;

-- 3. Elimina eventuali policy che permettono accesso anonimo
DROP POLICY IF EXISTS "Anonymous can view verified profiles" ON public.user;
DROP POLICY IF EXISTS "view_verified_profiles" ON public.user;

-- 4. Crea una policy più restrittiva per la visualizzazione profili
-- Solo utenti autenticati possono vedere profili verificati
CREATE POLICY "authenticated_view_verified_profiles" ON public.user
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id  -- Solo il proprio profilo
        OR (
            email_verified = true
            AND EXISTS (
                SELECT 1 FROM auth.users au 
                WHERE au.id = auth.uid() 
                AND au.email_confirmed_at IS NOT NULL
            )
        )
    );

-- 5. Assicura che solo utenti autenticati possano accedere ai dati
-- Mantiene solo i permessi per authenticated
GRANT SELECT, INSERT, UPDATE ON public.user TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- 6. Verifica che RLS sia abilitato
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 7. Verifica i permessi attuali
SELECT 
    'permissions_check' as component,
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('user', 'user_roles')
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

-- 8. Mostra le policy attive per verificare la sicurezza
SELECT 
    'active_policies' as component,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('user', 'user_roles')
ORDER BY tablename, policyname;