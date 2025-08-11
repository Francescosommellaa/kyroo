/*
  # Tabella Profiles e Sistema di Autenticazione

  1. Nuove Tabelle
    - `profiles`
      - `id` (uuid, primary key, FK a auth.users)
      - `email` (text, unique)
      - `display_name` (text, nullable)
      - `phone` (text, nullable)
      - `avatar_url` (text, nullable)
      - `role` (text, default 'user')
      - `created_at` (timestamptz, default now())

  2. Sicurezza
    - Abilita RLS sulla tabella profiles
    - Policy per lettura: utenti possono leggere il proprio profilo o admin possono leggere tutti
    - Policy per aggiornamento: utenti possono aggiornare il proprio profilo o admin possono aggiornare tutti
    - Funzione helper is_admin() per verificare ruolo admin

  3. Automazione
    - Trigger per creare automaticamente profilo quando si registra un nuovo utente
    - Gestisce inserimento automatico di id ed email dal sistema auth
*/

-- Crea tabella profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  phone text,
  avatar_url text,
  role text not null default 'user',
  created_at timestamptz default now()
);

-- Abilita Row Level Security
alter table public.profiles enable row level security;

-- Funzione helper per verificare se un utente è admin
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists(select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$;

-- Policy per lettura: utenti possono leggere il proprio profilo o admin possono leggere tutti
create policy "read_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));

-- Policy per aggiornamento: utenti possono aggiornare il proprio profilo o admin possono aggiornare tutti
create policy "update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin(auth.uid()));

-- Funzione per gestire la creazione automatica del profilo
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

-- Trigger per creare automaticamente il profilo quando si registra un nuovo utente
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();