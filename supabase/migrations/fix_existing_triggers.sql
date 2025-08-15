-- Elimina i trigger esistenti e ricrea il sistema correttamente

-- 1. Elimina tutti i trigger esistenti che dipendono dalla funzione handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- 2. Ora elimina la funzione
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Ricrea la funzione handle_new_user con logica migliorata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log per debug
    RAISE LOG 'Trigger handle_new_user chiamato per utente: %', NEW.email;
    
    -- Inserisce o aggiorna il record nella tabella public.user
    INSERT INTO public.user (
        id,
        email,
        full_name,
        avatar_url,
        provider,
        email_verified,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'display_name',
            ''
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url', 
            NEW.raw_user_meta_data->>'picture',
            ''
        ),
        CASE 
            WHEN NEW.app_metadata->>'provider' = 'google' THEN 'google'
            WHEN NEW.app_metadata->>'provider' = 'github' THEN 'github'
            WHEN NEW.app_metadata->>'provider' = 'facebook' THEN 'facebook'
            ELSE 'email'
        END,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        COALESCE(NEW.created_at, now()),
        COALESCE(NEW.updated_at, now())
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        provider = EXCLUDED.provider,
        email_verified = EXCLUDED.email_verified,
        updated_at = now();
    
    RAISE LOG 'Utente salvato con successo nella tabella public.user: %', NEW.email;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'ERRORE nel trigger handle_new_user: % %', SQLERRM, SQLSTATE;
        -- Non bloccare la registrazione anche se c'è un errore
        RETURN NEW;
END;
$$;

-- 4. Crea il trigger per INSERT
CREATE TRIGGER handle_new_user_insert
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Crea il trigger per UPDATE
CREATE TRIGGER handle_new_user_update
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. Garantisce i permessi corretti
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
GRANT ALL ON public.user TO anon, authenticated;

-- 7. Verifica finale
SELECT 'Sistema di trigger ricreato con successo' as status;

-- 8. Mostra i trigger creati
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name LIKE '%handle_new_user%'
AND event_object_schema = 'auth';