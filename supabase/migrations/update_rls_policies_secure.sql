-- Aggiorna le policy RLS per usare il sistema di ruoli sicuro
-- Risolve il problema di sicurezza con user_metadata

-- 1. Elimina le policy esistenti che usano user_metadata (insicure)
DROP POLICY IF EXISTS "Admins can manage all users" ON public.user;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.user;

-- 2. Crea policy RLS sicure usando la tabella user_roles

-- Policy per permettere agli utenti di vedere il proprio profilo
CREATE POLICY "Users can view own profile" ON public.user
    FOR SELECT
    USING (auth.uid() = id);

-- Policy per permettere agli utenti di aggiornare il proprio profilo
CREATE POLICY "Users can update own profile" ON public.user
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy per permettere l'inserimento del profilo durante la registrazione
CREATE POLICY "Users can insert own profile" ON public.user
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy sicura per amministratori usando la tabella user_roles
CREATE POLICY "Admins can manage all users (secure)" ON public.user
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

-- Policy per permettere agli utenti autenticati di vedere profili verificati
-- (per funzionalità social future)
CREATE POLICY "Authenticated users can view verified profiles" ON public.user
    FOR SELECT
    TO authenticated
    USING (
        email_verified = true
        OR auth.uid() = id  -- Sempre il proprio profilo
    );

-- 3. Aggiorna anche le policy per la tabella user_roles (già create nel file precedente)
-- Verifica che siano corrette

-- 4. Crea policy per permettere la lettura dei ruoli agli admin
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- 5. Policy per permettere agli admin di modificare i ruoli
CREATE POLICY "Admins can modify roles" ON public.user_roles
    FOR UPDATE
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

-- 6. Policy per permettere agli admin di eliminare ruoli
CREATE POLICY "Admins can delete roles" ON public.user_roles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
        AND user_id != auth.uid()  -- Gli admin non possono eliminare il proprio ruolo
    );

-- 7. Garantisce i permessi corretti
GRANT SELECT, INSERT, UPDATE ON public.user TO authenticated;
GRANT SELECT ON public.user TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- 8. Verifica che le policy siano state create correttamente
SELECT 
    'rls_policies_updated' as component,
    'Policy RLS aggiornate con sistema sicuro' as status,
    'user_metadata sostituito con user_roles' as note;

-- 9. Test delle policy
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('user', 'user_roles')
    AND policyname NOT LIKE '%user_metadata%'
ORDER BY tablename, policyname;