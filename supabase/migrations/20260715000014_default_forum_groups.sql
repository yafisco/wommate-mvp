-- Migration: Groupes thématiques par défaut pour le forum
-- Fichier: supabase/migrations/20260715000014_default_forum_groups.sql

-- Insérer des groupes thématiques par défaut si la table est vide
insert into public.groupes_thematiques (nom, description, couleur) values
  ('Informatique', 'Programmation, développement web, IA, bases de données et technologies numériques.', '#3B82F6'),
  ('Mathématiques', 'Algèbre, analyse, statistiques, probabilités et mathématiques appliquées.', '#8B5CF6'),
  ('Médecine', 'Anatomie, physiologie, pharmacologie et sciences médicales.', '#EF4444'),
  ('Droit', 'Droit civil, pénal, administratif et international.', '#F59E0B'),
  ('Économie', 'Microéconomie, macroéconomie, finance et gestion.', '#10B981'),
  ('Lettres & Langues', 'Littérature, linguistique, langues étrangères et communication.', '#EC4899'),
  ('Sciences', 'Physique, chimie, biologie et sciences expérimentales.', '#06B6D4'),
  ('Général', 'Discussions générales, orientation et vie étudiante.', '#6B7280')
on conflict do nothing;
