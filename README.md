# Plateforme Communautaire d'Entraide Étudiante (Wommate)

Ce projet est une plateforme web responsive d'entraide entre pairs étudiants, permettant le partage de ressources pédagogiques, la mise en relation avec des mentors, et des espaces de discussion/forum thématiques par filière.

---

## Stack Technique

- **Frontend** : Next.js (App Router, TypeScript, Tailwind CSS)
- **Backend & DB** : Supabase (Auth, PostgreSQL, RLS, Storage)

---

## Structure du Projet

```text
/app               # Routes et pages Next.js (App Router)
/components        # Composants React réutilisables
/hooks             # Hooks React personnalisés (ex: useAuth)
/lib               # Configurations (Supabase client/server)
/types             # Types TypeScript du projet
/supabase          # Fichiers de configuration & migrations SQL Supabase
```

---

## Démarrage en Local

### 1. Prérequis

Assurez-vous d'avoir installé :
- **Node.js** (v18.x ou supérieur recommandé)
- **NPM** (inclus avec Node.js)

### 2. Cloner et Installer les Dépendances

Installez les modules requis :
```bash
npm install
```

### 3. Configurer les Variables d'Environnement

1. Copiez le fichier `.env.local` s'il n'est pas déjà configuré (il est ignoré par Git pour des raisons de sécurité) :
   ```bash
   # Créez le fichier .env.local à la racine
   ```
2. Remplissez les clés suivantes avec les identifiants de votre projet Supabase (que vous trouverez dans les paramètres de votre projet Supabase sous **Project Settings > API**) :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-publique
   SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role
   ```

### 4. Mettre en place la Base de Données

Pour exécuter la migration de schéma sur votre projet Supabase :
1. Allez dans le tableau de bord de votre projet Supabase.
2. Cliquez sur l'onglet **SQL Editor** dans le menu latéral gauche.
3. Créez une nouvelle requête (**New Query**).
4. Copiez et collez le contenu du fichier de migration : [init_schema.sql](file:///c:/Users/HP/OneDrive/Bureau/MVP_WOMMATE/supabase/migrations/20260715000000_init_schema.sql).
5. Cliquez sur **Run** pour exécuter le script. Cela créera les tables, activera la sécurité RLS (Row Level Security), déclarera les politiques d'accès (Policies) et configurera le trigger automatique de création de profils à l'inscription.

### 5. Lancer l'Application en Mode Dev

Lancez le serveur de développement :
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour visualiser le projet.

---

## Commandes Disponibles

- `npm run dev` : Lance le serveur de développement local.
- `npm run build` : Compile l'application Next.js pour la production.
- `npm run start` : Démarre le serveur Next.js en production (après compilation).
- `npm run lint` : Analyse le code statique avec ESLint.
