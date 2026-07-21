-- MIGRATION INITIALE : Schéma de base de données pour la Plateforme d'Entraide Étudiante
-- Fichier : supabase/migrations/20260715000000_init_schema.sql

-- =========================================================================
-- 1. CRÉATION DES TABLES
-- =========================================================================

-- Table des Profils (étend auth.users de Supabase)
create table public.profils (
  id uuid primary key references auth.users(id) on delete cascade,
  nom_complet text,
  role text check (role in ('etudiant', 'mentor', 'enseignant', 'admin')) default 'etudiant',
  filiere text,
  niveau text,
  centres_interet text[] default array[]::text[],
  bio text,
  created_at timestamptz default now()
);

-- Table des Demandes d'Aide
create table public.demandes_aide (
  id uuid primary key default gen_random_uuid(),
  auteur_id uuid references public.profils(id) on delete cascade not null,
  titre text not null,
  filiere text,
  description text,
  niveau_requis text,
  statut text check (statut in ('ouverte', 'en_cours', 'resolue')) default 'ouverte',
  created_at timestamptz default now()
);

-- Table des Ressources Pédagogiques
create table public.ressources (
  id uuid primary key default gen_random_uuid(),
  auteur_id uuid references public.profils(id) on delete cascade not null,
  titre text not null,
  description text,
  filiere text,
  type text check (type in ('fichier', 'lien')) not null,
  url text not null,
  taille_octets bigint,
  created_at timestamptz default now()
);

-- Table des Messages Privés
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  expediteur_id uuid references public.profils(id) on delete cascade not null,
  destinataire_id uuid references public.profils(id) on delete cascade not null,
  contenu text not null,
  lu boolean default false,
  created_at timestamptz default now()
);

-- Table des Groupes Thématiques
create table public.groupes_thematiques (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  filiere text,
  description text
);

-- Table des Sujets du Forum
create table public.sujets_forum (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid references public.groupes_thematiques(id) on delete cascade not null,
  auteur_id uuid references public.profils(id) on delete cascade not null,
  titre text not null,
  contenu text,
  signale boolean default false,
  created_at timestamptz default now()
);

-- Table des Réponses du Forum
create table public.reponses_forum (
  id uuid primary key default gen_random_uuid(),
  sujet_id uuid references public.sujets_forum(id) on delete cascade not null,
  auteur_id uuid references public.profils(id) on delete cascade not null,
  contenu text not null,
  signale boolean default false,
  created_at timestamptz default now()
);

-- Table des Notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  destinataire_id uuid references public.profils(id) on delete cascade not null,
  type text,
  contenu text,
  lien text,
  lu boolean default false,
  created_at timestamptz default now()
);

-- =========================================================================
-- 2. FONCTIONS ET TRIGGERS UTILITIES
-- =========================================================================

-- Fonction pour vérifier si l'utilisateur connecté est un Admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profils
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Trigger pour créer automatiquement un profil lors de la création d'un utilisateur auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profils (id, nom_complet, role, filiere, niveau, bio, centres_interet)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom_complet', new.raw_user_meta_data->>'full_name', ''),
    'etudiant', -- Rôle par défaut
    null,
    null,
    null,
    array[]::text[]
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- 3. ACTIVATION DE LA SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- =========================================================================

alter table public.profils enable row level security;
alter table public.demandes_aide enable row level security;
alter table public.ressources enable row level security;
alter table public.messages enable row level security;
alter table public.groupes_thematiques enable row level security;
alter table public.sujets_forum enable row level security;
alter table public.reponses_forum enable row level security;
alter table public.notifications enable row level security;

-- =========================================================================
-- 4. DÉCLARATION DES POLITIQUES RLS (POLICIES)
-- =========================================================================

-- --- Table : profils ---
create policy "Les utilisateurs authentifiés peuvent lire les profils"
  on public.profils for select
  using (auth.role() = 'authenticated');

create policy "Les utilisateurs peuvent modifier leur propre profil"
  on public.profils for update
  using (auth.uid() = id or public.is_admin());

-- --- Table : demandes_aide ---
create policy "Lecture des demandes pour les utilisateurs authentifiés"
  on public.demandes_aide for select
  using (auth.role() = 'authenticated');

create policy "Création de demandes par l'auteur"
  on public.demandes_aide for insert
  with check (auth.uid() = auteur_id);

create policy "Modification de demandes par l'auteur ou admin"
  on public.demandes_aide for update
  using (auth.uid() = auteur_id or public.is_admin());

create policy "Suppression de demandes par l'auteur ou admin"
  on public.demandes_aide for delete
  using (auth.uid() = auteur_id or public.is_admin());

-- --- Table : ressources ---
create policy "Lecture des ressources pour les utilisateurs authentifiés"
  on public.ressources for select
  using (auth.role() = 'authenticated');

create policy "Création de ressources par l'auteur"
  on public.ressources for insert
  with check (auth.uid() = auteur_id);

create policy "Modification de ressources par l'auteur ou admin"
  on public.ressources for update
  using (auth.uid() = auteur_id or public.is_admin());

create policy "Suppression de ressources par l'auteur ou admin"
  on public.ressources for delete
  using (auth.uid() = auteur_id or public.is_admin());

-- --- Table : messages ---
create policy "Lecture des messages pour l'expéditeur ou le destinataire"
  on public.messages for select
  using (auth.uid() = expediteur_id or auth.uid() = destinataire_id);

create policy "Envoi de messages par l'expéditeur"
  on public.messages for insert
  with check (auth.uid() = expediteur_id);

create policy "Mise à jour du statut de lecture par le destinataire"
  on public.messages for update
  using (auth.uid() = destinataire_id)
  with check (auth.uid() = destinataire_id);

-- --- Table : groupes_thematiques ---
create policy "Lecture des groupes par tous les utilisateurs connectés"
  on public.groupes_thematiques for select
  using (auth.role() = 'authenticated');

create policy "Modifications réservées aux administrateurs"
  on public.groupes_thematiques for all
  using (public.is_admin());

-- --- Table : sujets_forum ---
create policy "Lecture des sujets par les utilisateurs authentifiés"
  on public.sujets_forum for select
  using (auth.role() = 'authenticated');

create policy "Création de sujets par l'auteur"
  on public.sujets_forum for insert
  with check (auth.uid() = auteur_id);

create policy "Modification de sujets par l'auteur ou admin"
  on public.sujets_forum for update
  using (auth.uid() = auteur_id or public.is_admin());

create policy "Suppression de sujets par l'auteur ou admin"
  on public.sujets_forum for delete
  using (auth.uid() = auteur_id or public.is_admin());

-- --- Table : reponses_forum ---
create policy "Lecture des réponses par les utilisateurs authentifiés"
  on public.reponses_forum for select
  using (auth.role() = 'authenticated');

create policy "Création de réponses par l'auteur"
  on public.reponses_forum for insert
  with check (auth.uid() = auteur_id);

create policy "Modification de réponses par l'auteur ou admin"
  on public.reponses_forum for update
  using (auth.uid() = auteur_id or public.is_admin());

create policy "Suppression de réponses par l'auteur ou admin"
  on public.reponses_forum for delete
  using (auth.uid() = auteur_id or public.is_admin());

-- --- Table : notifications ---
create policy "Lecture de ses propres notifications"
  on public.notifications for select
  using (auth.uid() = destinataire_id);

create policy "Modification de ses propres notifications par le destinataire"
  on public.notifications for update
  using (auth.uid() = destinataire_id)
  with check (auth.uid() = destinataire_id);
