-- Migration: Restriction création groupes thématiques aux admins/mentors
-- Fichier: supabase/migrations/20260718000003_forum_group_restriction.sql

-- =========================================================================
-- 1. CRÉATION DE LA FONCTION is_mentor()
-- =========================================================================

-- Fonction pour vérifier si l'utilisateur connecté est un Mentor
create or replace function public.is_mentor()
returns boolean as $$
begin
  return exists (
    select 1 from public.profils
    where id = auth.uid()
    and role = 'mentor'
  );
end;
$$ language plpgsql security definer;

-- =========================================================================
-- 2. MODIFICATION DES POLITIQUES RLS POUR groupes_thematiques
-- =========================================================================

-- Supprimer l'ancienne politique
drop policy if exists "Modifications réservées aux administrateurs" on public.groupes_thematiques;

-- Créer une nouvelle politique qui permet la création/modification aux admins et mentors
create policy "Modifications réservées aux administrateurs et mentors"
  on public.groupes_thematiques for all
  using (public.is_admin() or public.is_mentor());
