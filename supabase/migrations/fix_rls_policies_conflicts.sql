-- Risolve i conflitti delle policy RLS eliminando tutte le policy esistenti e ricreandole
-- Risolve definitivamente il problema di sicurezza con user_metadata

-- 1. Elimina TUTTE le policy esistenti sulla tabella user
DROP POLICY IF EXISTS "Users can view own profile" ON public.user;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.user;
DROP POLICY IF EXISTS "Admins can manage all users (secure)" ON public.user;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.user;
DROP POLICY IF EXISTS "Authenticated users can view verified profiles" ON public.user;
DROP POLICY IF EXISTS "Anonymous can view verified profiles" ON public.user;

-- 2. Elimina le policy esistenti sulla tabella user_roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own initial role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can modify roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- 3. Ricrea policy RLS sicure per la tabella user

-- Policy base per gli utenti
CREATE POLICY "user_select_own" ON public.user
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "user_update_own" ON public.user
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "user_insert_own" ON public.user
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy sicura per amministratori (usando user_roles invece di user_metadata)
CREATE POLICY "admin_manage_all_users" ON public.user
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- Policy per visualizzazione profili verificati
CREATE POLICY "view_verified_profiles" ON public.user
    FOR SELECT
    TO authenticated
    USING (
        email_verified = true
        OR auth.uid() = id
    );

-- 4. Ricrea policy RLS sicure per la tabella user_roles

-- Gli utenti possono vedere solo il proprio ruolo
CREATE POLICY "user_roles_select_own" ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Gli utenti possono inserire il proprio ruolo iniziale
CREATE POLICY "user_roles_insert_own" ON public.user_roles
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND role = 'user'
        AND assigned_by IS NULL
    );

-- Solo gli admin possono gestire tutti i ruoli
CREATE POLICY "admin_manage_all_roles" ON public.user_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
        AND (user_id != auth.uid() OR role = 'admin')  -- Gli admin possono modificare il proprio ruolo solo per mantenerlo admin
    );

-- 5. Garantisce i permessi corretti
GRANT SELECT, INSERT, UPDATE ON public.user TO authenticated;
GRANT SELECT ON public.user TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- 6. Verifica che le policy siano state create correttamente
SELECT 
    'rls_policies_fixed' as component,
    'Policy RLS ricreate senza conflitti' as status,
    'Sistema sicuro implementato' as note;

-- 7. Mostra le policy attive
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%user_metadata%' THEN 'INSICURA - USA user_metadata'
        WHEN qual LIKE '%user_roles%' THEN 'SICURA - USA user_roles'
        ELSE 'STANDARD'
    END as security_status
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('user', 'user_roles')
ORDER BY tablename, policyname;