-- Funzione per verificare l'esistenza di un trigger
CREATE OR REPLACE FUNCTION public.check_trigger_exists(trigger_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE trigger_name = $1
        AND event_object_schema = 'public'
    );
END;
$$;

-- Funzione per verificare l'esistenza di una funzione
CREATE OR REPLACE FUNCTION public.check_function_exists(function_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.routines 
        WHERE routine_name = $1
        AND routine_schema = 'public'
    );
END;
$$;

-- Garantisci i permessi necessari
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_trigger_exists(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_function_exists(text) TO anon, authenticated;