# Prompt 02 — Authentification & Profil étudiant (Must Have)

## Prompt à copier-coller

En te basant sur PROJECT_SPEC.md et le schéma de templates/schema_bdd.md, implémente le module Authentification & Profil étudiant.

Fonctionnalités attendues :
- Inscription / connexion par email + mot de passe via Supabase Auth (prévois les hooks pour ajouter l'OAuth réseaux sociaux plus tard, sans l'implémenter maintenant).
- Formulaire de création de profil étudiant : filière, niveau, centres d'intérêt, courte bio.
- Page "Mon profil" en lecture/édition.
- Redirection automatique vers la création de profil si l'utilisateur n'a pas encore de profil complet.
- Protection des routes : un utilisateur non connecté ne peut pas accéder aux pages internes.

Contraintes :
- Respecte la Definition of Done (templates/definition_of_done.md).
- Le parcours "créer un profil" doit être réalisable en moins de 3 minutes (critère de validation du cahier des charges) : reste simple, 2 écrans maximum.
- Mobile-first.

Propose le plan de fichiers avant d'exécuter.
