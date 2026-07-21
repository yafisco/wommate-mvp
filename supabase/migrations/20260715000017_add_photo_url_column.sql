-- Migration: Ajout de la colonne photo_url dans la table profils
-- Fichier: supabase/migrations/20260715000017_add_photo_url_column.sql

-- Ajouter la colonne photo_url si elle n'existe pas déjà
alter table public.profils add column if not exists photo_url text;
