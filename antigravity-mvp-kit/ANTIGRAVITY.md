# ANTIGRAVITY.md — Contexte projet pour l'agent IA

> Ce fichier est destiné à être lu par l'agent Antigravity (ou tout agent IA compatible : Cursor, Claude Code, etc.) en début de session pour comprendre le projet, les contraintes et les règles à respecter. Garde-le à la racine du repo.

## 1. Projet en une phrase
Plateforme web communautaire d'entraide étudiante : partage de ressources pédagogiques, mise en relation étudiant ↔ mentor, forum par filière.

## 2. Porteur du projet
- Ibrahima Tonton YAFA — formation Design Thinking & Innovation Digitale, encadrée par Wommate Technologie
- Document de référence complet : `PROJECT_SPEC.md` (à faire lire à l'agent avant toute génération de code)

## 3. Stack technique imposée
- **Frontend** : React / Next.js (App Router, TypeScript, Tailwind CSS), mobile-first, responsive
- **Backend & DB** : Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Déploiement** : Vercel ou Netlify (frontend) + Supabase Cloud (backend)
- **Sécurité** : Row Level Security (RLS) activée sur toutes les tables contenant des données utilisateur

## 4. Règles pour l'agent
1. Ne jamais sortir du périmètre MVP (voir "Hors périmètre" dans `PROJECT_SPEC.md`) sans validation explicite.
2. Prioriser strictement les fonctionnalités **Must Have** avant les **Should/Could Have**.
3. Sur toute tâche touchant plusieurs fichiers : proposer d'abord un plan (liste des fichiers à créer/modifier), attendre validation, puis exécuter (approche spec-first).
4. Respecter le modèle de données défini dans `templates/schema_bdd.md`. Ne pas renommer les entités sans le signaler explicitement.
5. Commentaires métier en français, noms de variables/fonctions en anglais (convention standard).
6. Chaque fonctionnalité livrée doit cocher la `templates/definition_of_done.md`.
7. Optimiser pour connectivité limitée : lazy loading, pagination, images compressées, dépendances légères.
8. Ne jamais implémenter : paiement/rémunération des mentors, application mobile native, traduction multilingue, intégration LMS (explicitement hors périmètre dans le cahier des charges).

## 5. Comment utiliser ce kit
- `PROJECT_SPEC.md` → contexte complet à donner à l'agent une fois en début de projet.
- `prompts/` → un prompt prêt à l'emploi par fonctionnalité/étape, à copier-coller dans le chat Antigravity, dans l'ordre suggéré ci-dessous.
- `templates/` → schéma de base de données, definition of done, gabarit de user story, prompt de revue de code.

## 6. Ordre d'exécution recommandé (aligné sur le planning du cahier des charges)
| Phase | Prompts à utiliser |
|---|---|
| Setup (avant S7) | `01_setup_projet.md` |
| Sprint 1 — S7-8 (Must Have) | `02_auth_profils.md`, `03_matching.md` |
| Sprint 2 — S9-10 (Should Have) | `04_messagerie.md`, `05_partage_ressources.md`, `06_forum.md`, `07_notifications.md` |
| Transverse | `08_admin_moderation.md` |
| Clôture — S11-12 | `09_tests_deploiement.md` |
| Avant chaque merge | `templates/prompt_review_code.md` |

## 7. KPIs à garder en tête pendant le développement
- 200 étudiants inscrits à 3 mois
- Taux de mise en relation réussie > 70 %
- Taux de satisfaction utilisateurs > 80 %
- Chargement < 3 secondes sur connexion mobile standard
- Upload/téléchargement de ressource (jusqu'à 5 Mo) en moins de 10 secondes
