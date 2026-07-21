# Prompt — Revue de code IA (avant merge)

## Prompt à copier-coller

Fais une revue de code sur les changements actuels (diff ou fichiers modifiés). Vérifie en particulier :
1. Failles de sécurité (RLS manquante, injection, exposition de clés/secrets).
2. Respect du périmètre MVP défini dans PROJECT_SPEC.md (pas de fonctionnalité hors scope).
3. Performance (requêtes N+1, absence de pagination, taille des bundles).
4. Lisibilité et conventions de nommage.
5. Cohérence avec le schéma de données de templates/schema_bdd.md.

Donne-moi une liste priorisée (bloquant / important / mineur) avant que je merge.
