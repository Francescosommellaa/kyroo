-- Ricrea completamente il trigger handle_new_user con gestione errori migliorata

-- 1. Elimina tutti i trigger esistenti che dipendono dalla funzione
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_insert ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_update ON auth.users;

-- 2. Elimina la funzione esistente con CASCADE
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Crea la funzione handle_new_user con gestione errori completa
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Log dell'inizio della funzione
    RAISE NOTICE 'handle_new_user: Inizio elaborazione per utente %', NEW.id;
    
    BEGIN
        -- Inserisce il nuovo utente nella tabella public.user
        INSERT INTO public.user (
            id,
            email,
            full_name,
            display_name,
            avatar_url,
            provider,
            email_verified,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            NEW.raw_user_meta_data->>'avatar_url',
            CASE 
                WHEN NEW.app_metadata->>'provider' IS NOT NULL THEN NEW.app_metadata->>'provider'
                WHEN NEW.raw_user_meta_data->>'provider' IS NOT NULL THEN NEW.raw_user_meta_data->>'provider'
                ELSE 'email'
            END,
            COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
            NEW.created_at,
            NOW()
        );
        
        RAISE NOTICE 'handle_new_user: Utente % inserito con successo nella tabella public.user', NEW.id;
        
        -- Inserisce il ruolo di default per il nuovo utente
        INSERT INTO public.user_roles (
            user_id,
            role,
            permissions,
            assigned_at,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            'user',
            '{}'::jsonb,
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'handle_new_user: Ruolo assegnato con successo per utente %', NEW.id;
        
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'handle_new_user: Utente % già esistente, aggiorno i dati', NEW.id;
            -- Se l'utente esiste già, aggiorna i dati
            UPDATE public.user SET
                email = NEW.email,
                full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', full_name),
                display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', display_name),
                avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
                email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, email_verified),
                updated_at = NOW()
            WHERE id = NEW.id;
            
        WHEN OTHERS THEN
            RAISE EXCEPTION 'handle_new_user: Errore durante l''inserimento dell''utente %: % %', NEW.id, SQLERRM, SQLSTATE;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crea il trigger
CREATE TRIGGER handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Assicura che i permessi siano corretti
GRANT ALL PRIVILEGES ON public.user TO authenticated;
GRANT ALL PRIVILEGES ON public.user TO anon;
GRANT ALL PRIVILEGES ON public.user_roles TO authenticated;
GRANT ALL PRIVILEGES ON public.user_roles TO anon;

-- 6. Verifica finale
SELECT 
    'Trigger ricreato:' as status,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'handle_new_user';