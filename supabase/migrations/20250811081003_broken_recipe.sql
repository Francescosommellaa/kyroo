/*
  # Storage setup for user avatars

  1. Storage Bucket
    - `avatars` bucket (private)
    - For user profile pictures

  2. Security Policies
    - Users can read their own avatars + admins can read all
    - Users can upload/update/delete only their own avatars
    - Admins can delete any avatar
*/

-- Create avatars bucket (private by default)
insert into storage.buckets (id, name, public) 
values ('avatars','avatars',false)
on conflict (id) do nothing;

-- Policy: Users can read their own avatars, admins can read all
create policy "avatar_read_own_or_admin" on storage.objects
  for select using (bucket_id='avatars' and (owner=auth.uid() or public.is_admin(auth.uid())));

-- Policy: Users can upload their own avatars
create policy "avatar_write_own" on storage.objects
  for insert with check (bucket_id='avatars' and owner=auth.uid());

-- Policy: Users can update their own avatars
create policy "avatar_update_own" on storage.objects
  for update using (bucket_id='avatars' and owner=auth.uid());

-- Policy: Users can delete their own avatars, admins can delete any
create policy "avatar_delete_own_or_admin" on storage.objects
  for delete using (bucket_id='avatars' and (owner=auth.uid() or public.is_admin(auth.uid())));