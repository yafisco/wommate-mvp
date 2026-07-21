-- Migration: Création du bucket pour les photos de profil
-- Fichier: supabase/migrations/20260715000015_profile_photos_bucket.sql

-- Création du bucket pour les photos de profil
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Activation de la RLS sur le bucket
alter table storage.objects enable row level security;

-- Politique : Les utilisateurs peuvent lire toutes les photos de profil (bucket public)
create policy "Les photos de profil sont publiques"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

-- Politique : Les utilisateurs authentifiés peuvent uploader leur propre photo de profil
create policy "Les utilisateurs peuvent uploader leur photo de profil"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique : Les utilisateurs peuvent remplacer leur propre photo de profil
create policy "Les utilisateurs peuvent remplacer leur photo de profil"
  on storage.objects for update
  with check (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique : Les utilisateurs peuvent supprimer leur propre photo de profil
create policy "Les utilisateurs peuvent supprimer leur photo de profil"
  on storage.objects for delete
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
