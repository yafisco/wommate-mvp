-- Migration: Ajout de contraintes NOT NULL pour améliorer l'intégrité des données
-- Fichier: supabase/migrations/20260715000011_add_not_null_constraints.sql

-- =========================================================================
-- 1. TABLE NOTIFICATIONS
-- =========================================================================

-- Type et contenu ne devraient pas être null
alter table public.notifications alter column type set not null;
alter table public.notifications alter column contenu set not null;

-- =========================================================================
-- 2. TABLE SUJETS_FORUM
-- =========================================================================

-- Le titre ne devrait pas être null
alter table public.sujets_forum alter column titre set not null;

-- =========================================================================
-- 3. TABLE RESSOURCES
-- =========================================================================

-- Le titre et l'URL ne devraient pas être null
alter table public.ressources alter column titre set not null;
alter table public.ressources alter column url set not null;

-- =========================================================================
-- 4. TABLE DEMANDES_AIDE
-- =========================================================================

-- Le titre ne devrait pas être null
alter table public.demandes_aide alter column titre set not null;

-- =========================================================================
-- 5. TABLE GROUPES_THEMATIQUES
-- =========================================================================

-- Le nom ne devrait pas être null
alter table public.groupes_thematiques alter column nom set not null;

-- =========================================================================
-- 6. TABLE PROPOSITIONS_AIDE
-- =========================================================================

-- Le message ne devrait pas être null
alter table public.propositions_aide alter column message set not null;
