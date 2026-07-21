-- Migration: Nettoyage de la table messages (colonnes obsolètes)
-- Fichier: supabase/migrations/20260715000010_cleanup_messages_table.sql

-- Les colonnes expediteur_id et destinataire_id sont obsolètes
-- car le système utilise maintenant conversation_id
-- Cette migration supprime ces colonnes pour nettoyer le schéma

-- D'abord, s'assurer que toutes les lignes ont un conversation_id valide
-- (normalement déjà fait par le système de conversations)

-- Supprimer les colonnes obsolètes
alter table public.messages drop column if exists expediteur_id;
alter table public.messages drop column if exists destinataire_id;

-- Ajouter une contrainte NOT NULL sur conversation_id
alter table public.messages alter column conversation_id set not null;

-- Ajouter une contrainte NOT NULL sur contenu
alter table public.messages alter column contenu set not null;
