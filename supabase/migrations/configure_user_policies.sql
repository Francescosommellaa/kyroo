-- CONFIGURAZIONE POLICY RLS AVANZATE PER TABELLA USER
-- Policy aggiuntive per garantire sicurezza e funzionalità complete

-- Verifica che RLS sia abilitato
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di leggere profili pubblici (opzionale)
-- Questa policy può essere utile per funzionalità social o di ricerca utenti
CREATE POLICY "Users can view public profiles" ON public.user
    FOR SELECT
    USING (
        -- Gli utenti possono vedere i propri profili
        auth.uid() = id 
        OR 
        -- Oppure profili di altri utenti se autenticati (per funzionalità future)
        (auth.role() = 'authenticated' AND email_verified = true)
    );

-- Policy per permettere agli amministratori di gestire tutti gli utenti
-- Utile per pannelli di amministrazione futuri
CREATE POLICY "Admins can manage all users" ON public.user
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR 
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    )
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
        OR 
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- Policy per permettere la lettura anonima di profili pubblici (se necessario)
-- Commentata per default, può essere abilitata se serve
/*
CREATE POLICY "Anonymous can view verified profiles" ON public.user
    FOR SELECT
    TO anon
    USING (email_verified = true);
*/

-- Assicura che i permessi di base siano configurati correttamente
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user TO authenticated;
GRANT SELECT ON public.user TO anon;

-- Permessi per le sequenze (se necessario in futuro)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verifica delle policy esistenti
-- Questa query può essere usata per debug
/*
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
*/

-- Verifica dei permessi
/*
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'user'
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;
*/

-- Commento di verifica
-- Policy RLS avanzate configurate per la tabella user