-- Migration: Optimisation du système de forum
-- Fichier: supabase/migrations/20260715000008_forum_system.sql

-- =========================================================================
-- 1. INDEX POUR PERFORMANCE
-- =========================================================================

-- Index pour les sujets
create index if not exists idx_sujets_forum_groupe_id on public.sujets_forum(groupe_id);
create index if not exists idx_sujets_forum_auteur_id on public.sujets_forum(auteur_id);
create index if not exists idx_sujets_forum_created_at on public.sujets_forum(created_at desc);
create index if not exists idx_sujets_forum_signale on public.sujets_forum(signale) where signale = true;

-- Index pour les réponses
create index if not exists idx_reponses_forum_sujet_id on public.reponses_forum(sujet_id);
create index if not exists idx_reponses_forum_auteur_id on public.reponses_forum(auteur_id);
create index if not exists idx_reponses_forum_created_at on public.reponses_forum(created_at desc);
create index if not exists idx_reponses_forum_signale on public.reponses_forum(signale) where signale = true;

-- Index pour les groupes
create index if not exists idx_groupes_thematiques_filiere on public.groupes_thematiques(filiere);

-- =========================================================================
-- 2. COLONNE UPDATED_AT POUR ACTIVITÉ RÉCENTE
-- =========================================================================

-- Ajouter updated_at aux sujets pour le tri par activité
alter table public.sujets_forum
add column if not exists updated_at timestamptz default now();

-- =========================================================================
-- 3. TRIGGER POUR METTRE À JOUR L'ACTIVITÉ DES SUJETS
-- =========================================================================

create or replace function public.update_sujet_activity()
returns trigger as $$
begin
  update public.sujets_forum
  set updated_at = now()
  where id = new.sujet_id;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger pour mettre à jour updated_at quand une réponse est ajoutée
create trigger on_reponse_created
  after insert on public.reponses_forum
  for each row
  execute procedure public.update_sujet_activity();

-- =========================================================================
-- 4. VUE: SUJETS AVEC COMPTEUR DE RÉPONSES
-- =========================================================================

create or replace view public.sujets_with_reponse_count as
select
  s.id,
  s.groupe_id,
  s.auteur_id,
  s.titre,
  s.contenu,
  s.signale,
  s.created_at,
  s.updated_at,
  p.nom_complet as auteur_nom,
  p.filiere as auteur_filiere,
  p.niveau as auteur_niveau,
  g.nom as groupe_nom,
  g.filiere as groupe_filiere,
  -- Compter les réponses
  (select count(*) from public.reponses_forum r where r.sujet_id = s.id)::int as reponse_count,
  -- Dernière activité
  (select max(r.created_at) from public.reponses_forum r where r.sujet_id = s.id) as derniere_reponse_at
from public.sujets_forum s
left join public.profils p on s.auteur_id = p.id
left join public.groupes_thematiques g on s.groupe_id = g.id;

-- =========================================================================
-- 5. VUE: RÉPONSES AVEC AUTEUR
-- =========================================================================

create or replace view public.reponses_with_auteur as
select
  r.id,
  r.sujet_id,
  r.auteur_id,
  r.contenu,
  r.signale,
  r.created_at,
  p.nom_complet as auteur_nom,
  p.filiere as auteur_filiere,
  p.niveau as auteur_niveau,
  p.role as auteur_role
from public.reponses_forum r
left join public.profils p on r.auteur_id = p.id;

-- =========================================================================
-- 6. FONCTION: SIGNALER UN SUJET
-- =========================================================================

create or replace function public.signaler_sujet(sujet_id uuid, motif text default null)
returns boolean as $$
begin
  update public.sujets_forum
  set signale = true
  where id = sujet_id;
  
  -- Créer une notification pour les admins (optionnel pour prompt 08)
  -- Pour l'instant, on se contente de marquer comme signalé
  
  return true;
end;
$$ language plpgsql security definer;

-- =========================================================================
-- 7. FONCTION: SIGNALER UNE RÉPONSE
-- =========================================================================

create or replace function public.signaler_reponse(reponse_id uuid, motif text default null)
returns boolean as $$
begin
  update public.reponses_forum
  set signale = true
  where id = reponse_id;
  
  -- Créer une notification pour les admins (optionnel pour prompt 08)
  -- Pour l'instant, on se contente de marquer comme signalé
  
  return true;
end;
$$ language plpgsql security definer;

-- =========================================================================
-- 8. DONNÉES INITIALES: GROUPES THÉMATIQUES
-- =========================================================================

-- Insérer des groupes thématiques par défaut
insert into public.groupes_thematiques (nom, filiere, description)
values
  ('Informatique', 'Informatique', 'Questions sur la programmation, algorithmes, bases de données et systèmes'),
  ('Mathématiques', 'Mathématiques', 'Algèbre, analyse, statistiques et probabilités'),
  ('Médecine', 'Médecine', 'Anatomie, physiologie, pathologie et sciences médicales'),
  ('Droit', 'Droit', 'Droit civil, pénal, administratif et international'),
  ('Économie', 'Économie', 'Microéconomie, macroéconomie, finance et gestion'),
  ('Lettres', 'Lettres', 'Littérature, linguistique, philosophie et arts'),
  ('Général', null, 'Questions transversales et vie étudiante')
on conflict do nothing;
