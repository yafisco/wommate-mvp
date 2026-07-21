-- Migration: Système de partage de ressources pédagogiques
-- Fichier: supabase/migrations/20260715000004_resources_system.sql

-- =========================================================================
-- 1. ALTÉRATION DE LA TABLE RESSOURCES
-- =========================================================================

-- Ajouter colonne pour le chemin du fichier dans Storage
alter table public.ressources
add column if not exists storage_path text,
add column if not exists download_count int default 0;

-- =========================================================================
-- 2. RLS POLICIES POUR RESSOURCES
-- =========================================================================

-- Supprimer les anciennes policies si elles existent
drop policy if exists "Ressources are publicly readable" on public.ressources;
drop policy if exists "Users can create ressources" on public.ressources;
drop policy if exists "Users can update own ressources" on public.ressources;
drop policy if exists "Users can delete own ressources" on public.ressources;

-- Policy: Toute ressource est lisible publiquement
create policy "Ressources are publicly readable"
  on public.ressources for select
  using (true);

-- Policy: Les utilisateurs authentifiés peuvent créer une ressource
create policy "Users can create ressources"
  on public.ressources for insert
  with check (
    auth.uid() = auteur_id
    and auth.uid() in (select id from public.profils)
  );

-- Policy: Les auteurs peuvent modifier leurs ressources
create policy "Users can update own ressources"
  on public.ressources for update
  using (auth.uid() = auteur_id)
  with check (auth.uid() = auteur_id);

-- Policy: Les auteurs peuvent supprimer leurs ressources
create policy "Users can delete own ressources"
  on public.ressources for delete
  using (auth.uid() = auteur_id);

-- =========================================================================
-- 3. INDEX POUR RECHERCHE ET PERFORMANCE
-- =========================================================================

-- Index sur filière pour recherche rapide
create index if not exists idx_ressources_filiere on public.ressources(filiere);

-- Index sur titre pour recherche texte
create index if not exists idx_ressources_titre on public.ressources(titre);

-- Index sur auteur pour afficher ressources d'un utilisateur
create index if not exists idx_ressources_auteur on public.ressources(auteur_id);

-- Index sur created_at pour tri
create index if not exists idx_ressources_created_at on public.ressources(created_at desc);

-- =========================================================================
-- 4. VUE: RESSOURCES AVEC AUTEUR
-- =========================================================================

create or replace view public.ressources_with_author as
select
  r.id,
  r.auteur_id,
  r.titre,
  r.description,
  r.filiere,
  r.type,
  r.url,
  r.taille_octets,
  r.storage_path,
  r.download_count,
  r.created_at,
  p.nom_complet as auteur_nom,
  p.filiere as auteur_filiere,
  p.niveau as auteur_niveau
from public.ressources r
left join public.profils p on r.auteur_id = p.id;

-- =========================================================================
-- 5. FONCTION: INCRÉMENTER COMPTEUR TÉLÉCHARGEMENTS
-- =========================================================================

create or replace function public.increment_download_count(resource_id uuid)
returns void as $$
begin
  update public.ressources
  set download_count = download_count + 1
  where id = resource_id;
end;
$$ language plpgsql security definer;

-- =========================================================================
-- 6. FONCTION: GÉNÉRER URL SIGNÉE POUR TÉLÉCHARGEMENT (10s)
-- =========================================================================

create or replace function public.get_signed_download_url(resource_id uuid)
returns text as $$
declare
  storage_path text;
  signed_url text;
begin
  -- Récupérer le chemin du fichier
  select r.storage_path into storage_path
  from public.ressources r
  where r.id = resource_id;
  
  if storage_path is null then
    raise exception 'Resource not found or has no file';
  end if;
  
  -- Retourner le chemin pour générer l'URL signée côté client
  -- (À faire dans le code Supabase client avec expiresIn: 10)
  return storage_path;
end;
$$ language plpgsql security definer;
