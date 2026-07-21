# Prompt 01 — Setup initial du projet

## À faire avant de coller ce prompt
Assure-toi que l'agent a accès à `ANTIGRAVITY.md` et `PROJECT_SPEC.md` (à la racine du repo), ou colle leur contenu juste avant ce prompt.

## Prompt à copier-coller

Tu es mon agent de développement pour le projet "Plateforme communautaire d'entraide étudiante" décrit dans PROJECT_SPEC.md.

Étape actuelle : setup initial du projet.

Merci de :
1. Initialiser un projet Next.js (App Router, TypeScript, Tailwind CSS).
2. Configurer la connexion Supabase (client + variables d'environnement dans .env.local, sans jamais committer les clés — ajoute .env.local au .gitignore).
3. Créer la structure de dossiers : /app, /components, /lib/supabase, /types, /hooks.
4. Mettre en place le schéma de base de données décrit dans templates/schema_bdd.md via une migration SQL Supabase, avec RLS activée sur toutes les tables.
5. Ajouter un README.md expliquant comment lancer le projet en local (installation, variables d'env, commandes).

Avant d'exécuter, propose-moi le plan détaillé (liste des fichiers à créer) et attends ma validation.
