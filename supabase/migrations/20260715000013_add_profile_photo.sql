-- Migration: Ajout de la photo de profil
-- Fichier: supabase/migrations/20260715000013_add_profile_photo.sql

-- Ajouter une colonne pour l'URL de la photo de profil
alter table public.profils add column if not exists photo_url text;
