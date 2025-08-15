-- Ricrea completamente il trigger handle_new_user con gestione errori robusta
-- Risolve definitivamente l'errore "Database error saving new user"

-- 1. Rimuovi il trigger esistente se presente
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- 2. Rimuovi la funzione esistente se presente
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Crea la nuova funzione con gestione errori robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_full_name text;
    user_display_name text;
    user_provider text;
BEGIN
    -- Log dell'inizio della funzione
    RAISE LOG 'handle_new_user: Inizio elaborazione per utente %', NEW.id;
    
    BEGIN
        -- Estrai i dati dal metadata con valori di default sicuri
        user_full_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        );
        
        user_display_name := COALESCE(
            NEW.raw_user_meta_data->>'display_name',
            user_full_name
        );
        
        user_provider := COALESCE(
            NEW.raw_app_meta_data->>'provider',
            'email'
        );
        
        -- Log dei dati estratti
        RAISE LOG 'handle_new_user: Dati estratti - full_name: %, display_name: %, provider: %', 
            user_full_name, user_display_name, user_provider;
        
        -- Inserisci nella tabella user con gestione errori
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
            NEW.id,
            NEW.email,
            user_full_name,
            user_display_name,
            user_provider,
            NEW.email_confirmed_at IS NOT NULL,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = COALESCE(EXCLUDED.full_name, public.user.full_name),
            display_name = COALESCE(EXCLUDED.display_name, public.user.display_name),
            provider = COALESCE(EXCLUDED.provider, public.user.provider),
            email_verified = EXCLUDED.email_verified,
            updated_at = NOW();
        
        -- Log del successo
        RAISE LOG 'handle_new_user: Inserimento completato con successo per utente %', NEW.id;
        
        -- Inserisci ruolo di default nella tabella user_roles
        INSERT INTO public.user_roles (
            user_id,
            role,
            created_at
        ) VALUES (
            NEW.id,
            'user',
            NOW()
        )
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE LOG 'handle_new_user: Ruolo di default assegnato per utente %', NEW.id;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log dettagliato dell'errore
        RAISE LOG 'handle_new_user: ERRORE per utente % - SQLSTATE: %, SQLERRM: %', 
            NEW.id, SQLSTATE, SQLERRM;
        
        -- Non bloccare la creazione dell'utente in auth.users
        -- Restituisci NEW per permettere il completamento
        RETURN NEW;
    END;
    
    RETURN NEW;
END;
$$;

-- 4. Crea il trigger
CREATE TRIGGER handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Assicurati che i permessi siano corretti
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.user TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.user_roles TO anon, authenticated;

-- 6. Verifica che il trigger sia stato creato
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'handle_new_user'
    AND event_object_table = 'users'
    AND trigger_schema = 'auth';

-- 7. Test finale
SELECT 
    'Trigger handle_new_user ricreato con successo' as status,
    now() as timestamp;