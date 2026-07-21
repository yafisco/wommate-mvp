# Prompt 04 — Messagerie privée (Should Have)

## Prompt à copier-coller

Implémente la messagerie privée entre étudiants, basée sur l'entité Message de templates/schema_bdd.md.

Fonctionnalités :
- Conversation 1-à-1, initiée depuis une demande d'aide ou un profil.
- Liste des conversations avec dernier message et indicateur non-lu.
- Envoi de texte (le partage de fichiers est traité dans le prompt 05).
- Temps réel via Supabase Realtime.

Contraintes : RLS stricte (un utilisateur ne voit que ses propres conversations), UI mobile-first, léger pour connectivité limitée. Propose le plan avant d'exécuter.
