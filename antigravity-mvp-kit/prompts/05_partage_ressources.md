# Prompt 05 — Partage de ressources pédagogiques (Should Have)

## Prompt à copier-coller

Implémente le module de partage de ressources pédagogiques, basé sur l'entité Ressource de templates/schema_bdd.md.

Fonctionnalités :
- Upload de fichiers (PDF, docs, liens) via Supabase Storage, taille max 5 Mo.
- Upload et téléchargement en moins de 10 secondes (critère de validation) : optimiser, afficher une barre de progression.
- Classement des ressources par filière/thématique.
- Recherche simple par mot-clé et filière.
- Page de détail ressource avec bouton téléchargement.

Contraintes : RLS sur la table ressources, validation du type et de la taille de fichier côté client ET serveur. Propose le plan avant d'exécuter.
