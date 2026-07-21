-- Migration: Fix mentor_rules_accepted column
-- Fichier: supabase/migrations/20260718000001_fix_mentor_rules_column.sql

-- Ajouter la colonne mentor_rules_accepted si elle n'existe pas
ALTER TABLE profils 
ADD COLUMN IF NOT EXISTS mentor_rules_accepted BOOLEAN DEFAULT false;

ALTER TABLE profils 
ADD COLUMN IF NOT EXISTS mentor_rules_accepted_at TIMESTAMPTZ;
