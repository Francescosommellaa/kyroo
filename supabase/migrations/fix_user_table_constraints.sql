-- Rimuove il vincolo di chiave esterna problematico e riconfigura la tabella user

-- 1. Trova e rimuove tutti i vincoli di chiave esterna sulla tabella user
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc
        WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_schema = 'public'
            AND tc.table_name = 'user'
    LOOP
        EXECUTE 'ALTER TABLE public.user DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
        RAISE NOTICE 'Rimosso vincolo FK: %', constraint_record.constraint_name;
    END LOOP;
END
$$;

-- 2. Assicura che la tabella user abbia la struttura corretta
ALTER TABLE public.user 
    ALTER COLUMN id SET NOT NULL,
    ALTER COLUMN email SET NOT NULL,
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();

-- 3. Crea un indice sulla colonna email per performance
CREATE INDEX IF NOT EXISTS idx_user_email ON public.user(email);

-- 4. Assicura che i permessi siano corretti
GRANT ALL PRIVILEGES ON public.user TO authenticated;
GRANT ALL PRIVILEGES ON public.user TO anon;
GRANT ALL PRIVILEGES ON public.user_roles TO authenticated;
GRANT ALL PRIVILEGES ON public.user_roles TO anon;

-- 5. Abilita RLS sulla tabella user se non è già abilitato
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;

-- 6. Crea policy RLS permissive per permettere inserimenti dal trigger
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user;
DROP POLICY IF EXISTS "Allow trigger to insert users" ON public.user;

-- Policy per permettere al trigger di inserire utenti
CREATE POLICY "Allow trigger to insert users" ON public.user
    FOR INSERT
    WITH CHECK (true);

-- Policy per permettere agli utenti di vedere il proprio profilo
CREATE POLICY "Users can view their own profile" ON public.user
    FOR SELECT
    USING (auth.uid() = id);

-- Policy per permettere agli utenti di aggiornare il proprio profilo
CREATE POLICY "Users can update their own profile" ON public.user
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 7. Test di inserimento diretto per verificare che ora funzioni
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
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    'test-fixed@example.com',
    'Test Fixed User',
    'Test Fixed User',
    'email',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. Verifica che l'inserimento sia riuscito
SELECT 
    'Test inserimento riuscito:' as status,
    id,
    email,
    full_name,
    display_name
FROM public.user 
WHERE id = '550e8400-e29b-41d4-a716-446655440003';

-- 9. Pulizia
DELETE FROM public.user WHERE id = '550e8400-e29b-41d4-a716-446655440003';

SELECT 'Configurazione tabella user completata' as final_status;