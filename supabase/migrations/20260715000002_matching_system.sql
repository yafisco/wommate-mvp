-- Migration: Système de matching et propositions d'aide
-- Fichier: supabase/migrations/20260715000002_matching_system.sql

-- =========================================================================
-- 1. CRÉATION DE LA TABLE DES PROPOSITIONS D'AIDE
-- =========================================================================

create table public.propositions_aide (
  id uuid primary key default gen_random_uuid(),
  demande_id uuid references public.demandes_aide(id) on delete cascade not null,
  mentor_id uuid references public.profils(id) on delete cascade not null,
  message text,
  statut text check (statut in ('en_attente', 'acceptee', 'refusee')) default 'en_attente',
  created_at timestamptz default now(),
  -- Eviter qu'un mentor propose plusieurs fois de l'aide pour la même demande
  constraint unique_demande_mentor unique (demande_id, mentor_id)
);

-- Activation de la RLS
alter table public.propositions_aide enable row level security;

-- Déclaration des Politiques RLS (Policies)
create policy "Les utilisateurs connectés peuvent voir les propositions de leurs demandes ou les leurs"
  on public.propositions_aide for select
  using (
    auth.uid() = mentor_id 
    or exists (
      select 1 from public.demandes_aide d 
      where d.id = demande_id and d.auteur_id = auth.uid()
    )
  );

create policy "Les mentors peuvent créer une proposition d'aide"
  on public.propositions_aide for insert
  with check (
    auth.uid() = mentor_id 
    and auth.uid() != (
      select auteur_id from public.demandes_aide 
      where id = demande_id
    )
  );

create policy "Les personnes concernées peuvent modifier le statut d'une proposition"
  on public.propositions_aide for update
  using (
    auth.uid() = mentor_id 
    or exists (
      select 1 from public.demandes_aide d 
      where d.id = demande_id and d.auteur_id = auth.uid()
    )
  );

create policy "Les mentors peuvent supprimer leur proposition en attente"
  on public.propositions_aide for delete
  using (auth.uid() = mentor_id and statut = 'en_attente');

-- =========================================================================
-- 2. FONCTION DE MATCHING DES MENTORS
-- =========================================================================

create or replace function public.match_mentors_for_demande(demande_uuid uuid)
returns table (
  id uuid,
  nom_complet text,
  role text,
  filiere text,
  niveau text,
  centres_interet text[],
  bio text,
  created_at timestamptz,
  score bigint
) as $$
declare
  d_filiere text;
  d_titre text;
  d_desc text;
  d_auteur uuid;
begin
  -- Récupérer les détails de la demande
  select filiere, titre, description, auteur_id
  into d_filiere, d_titre, d_desc, d_auteur
  from public.demandes_aide
  where demandes_aide.id = demande_uuid;

  return query
  select
    p.id,
    p.nom_complet,
    p.role,
    p.filiere,
    p.niveau,
    p.centres_interet,
    p.bio,
    p.created_at,
    (
      -- Score de filière identique (+2 points)
      (case when p.filiere = d_filiere then 2 else 0 end) +
      -- Score de compétences correspondantes dans le titre et la description (+1 point par mot-clé trouvé)
      (
        select count(*)
        from unnest(p.centres_interet) as keyword
        where lower(d_titre || ' ' || coalesce(d_desc, '')) ilike '%' || lower(keyword) || '%'
      )
    )::bigint as score
  from public.profils p
  where 
    -- Exclure l'auteur de la demande
    p.id != d_auteur
    -- N'avoir que des personnes ayant un profil avec filière ou centres_intérêt
    and (
      (case when p.filiere = d_filiere then 2 else 0 end) +
      (
        select count(*)
        from unnest(p.centres_interet) as keyword
        where lower(d_titre || ' ' || coalesce(d_desc, '')) ilike '%' || lower(keyword) || '%'
      )
    ) > 0
  order by score desc, p.nom_complet asc
  limit 10;
end;
$$ language plpgsql security definer;

-- =========================================================================
-- 3. VUE DE STATISTIQUES POUR MESURER LE TAUX DE MATCHING (OBJECTIF 70%)
-- =========================================================================

create or replace view public.matching_stats as
with coverage as (
  select
    d.id,
    exists (
      -- Vérifie s'il existe au moins 1 mentor avec un score de matching > 0
      select 1 from public.profils p
      where p.id != d.auteur_id
      and (
        (case when p.filiere = d.filiere then 2 else 0 end) +
        (
          select count(*)
          from unnest(p.centres_interet) as keyword
          where lower(d.titre || ' ' || coalesce(d.description, '')) ilike '%' || lower(keyword) || '%'
        )
      ) > 0
    ) as a_des_matchs_potentiels,
    exists (
      -- Vérifie s'il y a une proposition d'aide réelle
      select 1 from public.propositions_aide pr
      where pr.demande_id = d.id
    ) as a_des_propositions_reelles
  from public.demandes_aide d
)
select
  count(*)::bigint as total_demandes,
  count(nullif(a_des_matchs_potentiels, false))::bigint as demandes_avec_matchs_systeme,
  count(nullif(a_des_propositions_reelles, false))::bigint as demandes_avec_propositions_reelles,
  round(
    (count(nullif(a_des_matchs_potentiels, false))::numeric / nullif(count(*), 0)) * 100,
    2
  ) as taux_couverture_systeme_pourcentage,
  round(
    (count(nullif(a_des_propositions_reelles, false))::numeric / nullif(count(*), 0)) * 100,
    2
  ) as taux_propositions_reelles_pourcentage
from coverage;
