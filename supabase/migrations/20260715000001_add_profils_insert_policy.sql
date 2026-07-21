-- MIGRATION : Ajout de la politique RLS INSERT sur profils
-- Permet aux utilisateurs authentifiés de créer leur propre profil lors de l'onboarding
-- Cette politique est nécessaire car l'upsert côté client a besoin du droit INSERT

create policy "Les utilisateurs peuvent créer leur propre profil"
  on public.profils for insert
  with check (auth.uid() = id);
