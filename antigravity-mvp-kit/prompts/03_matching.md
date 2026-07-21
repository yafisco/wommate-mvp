# Prompt 03 — Mise en relation / matching (Must Have)

## Prompt à copier-coller

Implémente le système de mise en relation entre étudiants (matching besoins ↔ compétences), basé sur l'entité DemandeAide de templates/schema_bdd.md.

Fonctionnalités attendues :
- Un étudiant peut publier une "demande d'aide" (titre, filière, description, niveau requis).
- Le système propose une liste de mentors/étudiants pertinents en fonction de la filière et des compétences déclarées dans leur profil (matching simple par filière + mots-clés pour le MVP, pas de ML pour l'instant — une intégration IA future est envisagée mais hors scope MVP).
- Un mentor peut consulter la liste des demandes correspondant à son profil et proposer son accompagnement.
- Objectif métier : au moins un mentor ou une ressource pertinent(e) proposé(e) pour 70 % des demandes (critère de validation). Structure le code pour pouvoir mesurer ce taux facilement (table de suivi ou logs).

Contraintes techniques : Supabase Edge Function ou requête SQL, RLS respectée. Propose le plan avant d'exécuter.
