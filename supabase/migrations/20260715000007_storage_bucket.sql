-- Migration: Création et configuration du bucket Supabase Storage pour ressources
-- Fichier: supabase/migrations/20260715000007_storage_bucket.sql

-- =========================================================================
-- 1. CRÉATION DU BUCKET DE STOCKAGE
-- =========================================================================

-- Insérer le bucket ressources-pedagogiques
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ressources-pedagogiques',
  'ressources-pedagogiques',
  false, -- privé (accès via URLs signées uniquement)
  5242880, -- 5 Mo en octets
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'text/plain',
    'text/csv',
    'application/zip',
    'video/mp4',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
)
on conflict (id) do nothing;

-- =========================================================================
-- 2. RLS POLICIES POUR LE BUCKET
-- =========================================================================

-- Politique: Les utilisateurs authentifiés peuvent uploader des fichiers
create policy "Authenticated users can upload files"
  on storage.objects for insert
  with check (
    bucket_id = 'ressources-pedagogiques'
    and auth.uid()::text = (storage.foldername(name))[1]
    and auth.role() = 'authenticated'
  );

-- Politique: Les utilisateurs peuvent télécharger leurs propres fichiers
create policy "Users can download own files"
  on storage.objects for select
  using (
    bucket_id = 'ressources-pedagogiques'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique: Les utilisateurs peuvent supprimer leurs propres fichiers
create policy "Users can delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'ressources-pedagogiques'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique: Les utilisateurs peuvent mettre à jour leurs propres fichiers
create policy "Users can update own files"
  on storage.objects for update
  with check (
    bucket_id = 'ressources-pedagogiques'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
