-- Query per verificare i log dettagliati di Supabase
-- Controlla errori di registrazione, invio email e problemi del database

-- 1. Verifica gli ultimi eventi di autenticazione
SELECT 
  'Recent Auth Events' as check_type,
  created_at,
  payload->>'action' as action,
  payload->>'actor_id' as actor_id,
  payload->>'actor_username' as actor_username,
  payload->>'actor_via_sso' as via_sso,
  payload->>'log_type' as log_type,
  payload->>'traits' as traits,
  ip_address
FROM auth.audit_log_entries 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 20;

-- 2. Verifica utenti con problemi di conferma email
SELECT 
  'Users with Email Issues' as check_type,
  id,
  email,
  email_confirmed_at,
  confirmation_sent_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL AND confirmation_sent_at IS NOT NULL 
    THEN 'Email sent but not confirmed'
    WHEN email_confirmed_at IS NULL AND confirmation_sent_at IS NULL 
    THEN 'No confirmation email sent'
    ELSE 'Email confirmed'
  END as email_status,
  raw_app_meta_data,
  raw_user_meta_data
FROM auth.users 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 3. Verifica token di conferma attivi
SELECT 
  'Active Confirmation Tokens' as check_type,
  user_id,
  token_type,
  created_at,
  updated_at,
  CASE 
    WHEN created_at < NOW() - INTERVAL '24 hours' 
    THEN 'Token expired (>24h)'
    WHEN created_at < NOW() - INTERVAL '1 hour' 
    THEN 'Token old (>1h)'
    ELSE 'Token recent'
  END as token_status
FROM auth.one_time_tokens 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 4. Verifica errori specifici nei log di audit
SELECT 
  'Auth Errors' as check_type,
  created_at,
  payload->>'action' as action,
  payload->>'error' as error_message,
  payload->>'actor_id' as actor_id,
  payload
FROM auth.audit_log_entries 
WHERE payload->>'error' IS NOT NULL
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Verifica la tabella user per problemi di inserimento
SELECT 
  'User Table Status' as check_type,
  COUNT(*) as total_users,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as users_last_24h,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as users_last_7d
FROM public.user;

-- 6. Verifica utenti auth vs utenti public
SELECT 
  'Auth vs Public Users' as check_type,
  (
    SELECT COUNT(*) 
    FROM auth.users 
    WHERE created_at >= NOW() - INTERVAL '7 days'
  ) as auth_users_7d,
  (
    SELECT COUNT(*) 
    FROM public.user 
    WHERE created_at >= NOW() - INTERVAL '7 days'
  ) as public_users_7d,
  (
    SELECT COUNT(*) 
    FROM auth.users au
    LEFT JOIN public.user pu ON au.id = pu.id
    WHERE au.created_at >= NOW() - INTERVAL '7 days'
      AND pu.id IS NULL
  ) as auth_without_public;

-- 7. Verifica configurazione RLS
SELECT 
  'RLS Configuration' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables pt
WHERE schemaname = 'public'
  AND tablename IN ('user');

-- 8. Verifica permessi tabella user
SELECT 
  'Table Permissions' as check_type,
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'user'
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee;