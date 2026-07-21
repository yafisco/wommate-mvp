# Schéma de base de données — proposition (Supabase / PostgreSQL)

> À adapter/valider avec l'agent lors du setup (prompt 01). RLS obligatoire sur toutes les tables.

```sql
-- Étend la table auth.users de Supabase
create table profils (
  id uuid primary key references auth.users(id) on delete cascade,
  nom_complet text,
  role text check (role in ('etudiant', 'mentor', 'enseignant', 'admin')) default 'etudiant',
  filiere text,
  niveau text,
  centres_interet text[],
  bio text,
  created_at timestamptz default now()
);

create table demandes_aide (
  id uuid primary key default gen_random_uuid(),
  auteur_id uuid references profils(id) on delete cascade,
  titre text not null,
  filiere text,
  description text,
  niveau_requis text,
  statut text check (statut in ('ouverte', 'en_cours', 'resolue')) default 'ouverte',
  created_at timestamptz default now()
);

create table ressources (
  id uuid primary key default gen_random_uuid(),
  auteur_id uuid references profils(id) on delete cascade,
  titre text not null,
  description text,
  filiere text,
  type text check (type in ('fichier', 'lien')),
  url text not null,
  taille_octets bigint,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  expediteur_id uuid references profils(id) on delete cascade,
  destinataire_id uuid references profils(id) on delete cascade,
  contenu text not null,
  lu boolean default false,
  created_at timestamptz default now()
);

create table groupes_thematiques (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  filiere text,
  description text
);

create table sujets_forum (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid references groupes_thematiques(id) on delete cascade,
  auteur_id uuid references profils(id) on delete cascade,
  titre text not null,
  contenu text,
  signale boolean default false,
  created_at timestamptz default now()
);

create table reponses_forum (
  id uuid primary key default gen_random_uuid(),
  sujet_id uuid references sujets_forum(id) on delete cascade,
  auteur_id uuid references profils(id) on delete cascade,
  contenu text not null,
  signale boolean default false,
  created_at timestamptz default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  destinataire_id uuid references profils(id) on delete cascade,
  type text,
  contenu text,
  lien text,
  lu boolean default false,
  created_at timestamptz default now()
);
```

## Notes RLS
- Chaque table doit avoir une policy `select`/`insert`/`update` limitant l'accès au propriétaire (`auteur_id`, `destinataire_id`, `expediteur_id`) ou au rôle `admin`.
- La table `profils` : lecture publique limitée aux champs non sensibles pour permettre le matching ; écriture réservée au propriétaire.
- Les tables `messages` : un utilisateur ne peut lire que les lignes où il est `expediteur_id` ou `destinataire_id`.
