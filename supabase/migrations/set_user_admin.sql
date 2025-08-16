-- Script SQL per impostare un utente come admin
-- Utilizzo: sostituire 'user@example.com' con l'email dell'utente da promuovere

-- Funzione per impostare un utente come admin
CREATE OR REPLACE FUNCTION set_user_as_admin(user_email TEXT)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  full_name TEXT,
  old_role TEXT,
  new_role TEXT,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  target_user_id UUID;
  current_role TEXT;
  admin_user_id UUID;
BEGIN
  -- Trova l'utente per email
  SELECT u.id, u.role INTO target_user_id, current_role
  FROM public.user u
  WHERE u.email = user_email;
  
  -- Controlla se l'utente esiste
  IF target_user_id IS NULL THEN
    RETURN QUERY SELECT 
      NULL::UUID,
      user_email,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      FALSE,
      'Utente non trovato con email: ' || user_email;
    RETURN;
  END IF;
  
  -- Controlla se l'utente è già admin
  IF current_role = 'admin' THEN
    RETURN QUERY SELECT 
      target_user_id,
      user_email,
      (SELECT full_name FROM public.user WHERE id = target_user_id),
      current_role,
      'admin'::TEXT,
      TRUE,
      'Utente è già admin';
    RETURN;
  END IF;
  
  -- Aggiorna il ruolo nella tabella user
  UPDATE public.user 
  SET role = 'admin', updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Inserisci o aggiorna nella tabella user_roles
  INSERT INTO public.user_roles (user_id, role, permissions, assigned_at)
  VALUES (
    target_user_id, 
    'admin', 
    '{"admin": true, "manage_users": true, "manage_content": true, "manage_settings": true}'::jsonb,
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = 'admin',
    permissions = '{"admin": true, "manage_users": true, "manage_content": true, "manage_settings": true}'::jsonb,
    updated_at = NOW();
  
  -- Restituisci il risultato
  RETURN QUERY SELECT 
    target_user_id,
    user_email,
    (SELECT full_name FROM public.user WHERE id = target_user_id),
    current_role,
    'admin'::TEXT,
    TRUE,
    'Utente promosso ad admin con successo';
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per rimuovere i privilegi admin
CREATE OR REPLACE FUNCTION remove_admin_role(user_email TEXT)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  full_name TEXT,
  old_role TEXT,
  new_role TEXT,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  target_user_id UUID;
  current_role TEXT;
BEGIN
  -- Trova l'utente per email
  SELECT u.id, u.role INTO target_user_id, current_role
  FROM public.user u
  WHERE u.email = user_email;
  
  -- Controlla se l'utente esiste
  IF target_user_id IS NULL THEN
    RETURN QUERY SELECT 
      NULL::UUID,
      user_email,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      FALSE,
      'Utente non trovato con email: ' || user_email;
    RETURN;
  END IF;
  
  -- Aggiorna il ruolo nella tabella user
  UPDATE public.user 
  SET role = 'user', updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Aggiorna nella tabella user_roles
  UPDATE public.user_roles 
  SET 
    role = 'user',
    permissions = '{}'::jsonb,
    updated_at = NOW()
  WHERE user_id = target_user_id;
  
  -- Restituisci il risultato
  RETURN QUERY SELECT 
    target_user_id,
    user_email,
    (SELECT full_name FROM public.user WHERE id = target_user_id),
    current_role,
    'user'::TEXT,
    TRUE,
    'Privilegi admin rimossi con successo';
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per visualizzare tutti gli admin
CREATE OR REPLACE FUNCTION list_admin_users()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  full_name TEXT,
  display_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  permissions JSONB
) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.display_name,
    u.role,
    u.created_at,
    COALESCE(ur.permissions, '{}'::jsonb) as permissions
  FROM public.user u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  WHERE u.role = 'admin'
  ORDER BY u.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Esempi di utilizzo:
-- 
-- 1. Impostare un utente come admin:
-- SELECT * FROM set_user_as_admin('user@example.com');
--
-- 2. Rimuovere privilegi admin:
-- SELECT * FROM remove_admin_role('user@example.com');
--
-- 3. Visualizzare tutti gli admin:
-- SELECT * FROM list_admin_users();

-- Commenti per l'utilizzo:
-- Sostituire 'user@example.com' con l'email effettiva dell'utente
-- Le funzioni restituiscono informazioni dettagliate sull'operazione eseguita
-- Le funzioni sono sicure e controllano l'esistenza dell'utente prima di procedere