-- Script per verificare utenti esistenti e creare admin
-- Prima controlla se ci sono utenti esistenti
SELECT 
  email, 
  full_name, 
  role, 
  created_at 
FROM public.user 
ORDER BY created_at;

-- Se non ci sono utenti, questo script può essere usato per promuovere il primo utente registrato
-- Sostituire 'your-email@example.com' con l'email dell'utente da promuovere
-- SELECT * FROM set_user_as_admin('your-email@example.com');

-- Per visualizzare tutti gli admin attuali:
-- SELECT * FROM list_admin_users();