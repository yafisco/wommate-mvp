-- Migration: Règles de mentorat
-- Fichier: supabase/migrations/20260715000012_mentor_rules.sql

-- =========================================================================
-- 1. CRÉATION DE LA TABLE DES RÈGLES DE MENTORAT
-- =========================================================================

create table public.mentor_rules (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text not null,
  ordre int not null default 0,
  created_at timestamptz default now()
);

-- Activation de la RLS
alter table public.mentor_rules enable row level security;

-- Politique : Tout le monde peut lire les règles
create policy "Tout le monde peut lire les règles de mentorat"
  on public.mentor_rules for select
  using (true);

-- Politique : Seuls les admins peuvent modifier les règles
create policy "Seuls les admins peuvent modifier les règles"
  on public.mentor_rules for all
  using (public.is_admin());

-- =========================================================================
-- 2. INSERTION DES RÈGLES PAR DÉFAUT
-- =========================================================================

insert into public.mentor_rules (titre, description, ordre) values
  ('Niveau minimum requis', 'Vous devez avoir atteint au moins le niveau L3 (Licence 3) ou équivalent pour devenir mentor.', 1),
  ('Expertise dans votre domaine', 'Vous devez avoir une solide compréhension de votre filière et des matières dans lesquelles vous souhaitez aider.', 2),
  ('Engagement de disponibilité', 'En tant que mentor, vous vous engagez à répondre aux demandes dans un délai raisonnable (maximum 48h).', 3),
  ('Respect et bienveillance', 'Vous devez traiter tous les étudiants avec respect, bienveillance et sans discrimination.', 4),
  ('Confidentialité', 'Vous devez respecter la confidentialité des informations partagées par les étudiants.', 5),
  ('Pas de rémunération', ''Le mentorat sur Wommate est bénévole. Toute demande de rémunération est strictement interdite.', 6),
  ('Qualité des réponses', 'Vous devez fournir des réponses de qualité, précises et adaptées au niveau de l''étudiant.', 7),
  ('Signalement des abus', 'Vous vous engagez à signaler tout comportement inapproprié ou abusif à l''administration.', 8);

-- =========================================================================
-- 3. AJOUT D''UNE COLONNE POUR SUIVI L''ACCEPTATION DES RÈGLES
-- =========================================================================

-- Ajouter une colonne dans profils pour suivre si l'utilisateur a accepté les règles
alter table public.profils add column if not exists mentor_rules_accepted boolean default false;
alter table public.profils add column if not exists mentor_rules_accepted_at timestamptz;
