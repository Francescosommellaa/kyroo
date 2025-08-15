-- Verifica e corregge la funzione handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log per debugging
    RAISE LOG 'handle_new_user triggered for user: %', NEW.id;
    
    INSERT INTO public.user (
        id,
        email,
        full_name,
        avatar_url,
        provider,
        email_verified
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            NEW.raw_user_meta_data->>'name', 
            split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        CASE 
            WHEN NEW.app_metadata->>'provider' = 'google' THEN 'google'
            WHEN NEW.app_metadata->>'provider' = 'github' THEN 'github'
            WHEN NEW.app_metadata->>'provider' = 'facebook' THEN 'facebook'
            ELSE 'email'
        END,
        COALESCE((NEW.email_confirmed_at IS NOT NULL), false)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.user.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.user.avatar_url),
        provider = EXCLUDED.provider,
        email_verified = EXCLUDED.email_verified,
        updated_at = now();
    
    RAISE LOG 'User successfully inserted/updated in public.user table: %', NEW.id;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        -- Non rilanciare l'errore per non bloccare la registrazione in auth.users
        RETURN NEW;
END;
$$;

-- Garantisci i permessi per la tabella user
GRANT SELECT, INSERT, UPDATE ON public.user TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;