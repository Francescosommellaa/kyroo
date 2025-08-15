-- Aggiunge il campo display_name alla tabella user
-- Il display_name è il nome visualizzato nella UI, sidebar e chatbot
-- Se non specificato, di default è uguale al full_name

ALTER TABLE public.user 
ADD COLUMN display_name text;

-- Aggiorna i record esistenti impostando display_name uguale a full_name
UPDATE public.user 
SET display_name = full_name 
WHERE display_name IS NULL;

-- Crea un trigger per impostare automaticamente display_name = full_name se non specificato
CREATE OR REPLACE FUNCTION set_default_display_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Se display_name non è specificato, usa full_name
  IF NEW.display_name IS NULL OR NEW.display_name = '' THEN
    NEW.display_name := NEW.full_name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica il trigger su INSERT e UPDATE
DROP TRIGGER IF EXISTS trigger_set_default_display_name ON public.user;
CREATE TRIGGER trigger_set_default_display_name
  BEFORE INSERT OR UPDATE ON public.user
  FOR EACH ROW
  EXECUTE FUNCTION set_default_display_name();

-- Commento sulla colonna per chiarire l'uso
COMMENT ON COLUMN public.user.display_name IS 'Nome visualizzato nella UI, sidebar e chatbot. Se non specificato, di default è uguale a full_name';
COMMENT ON COLUMN public.user.full_name IS 'Nome completo dell''utente';