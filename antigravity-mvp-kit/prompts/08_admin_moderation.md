# Prompt 08 — Administration & modération (Must Have, transverse)

## Prompt à copier-coller

Implémente une interface d'administration accessible uniquement au rôle "admin" (champ role dans la table utilisateurs).

Fonctionnalités :
- Vue liste des utilisateurs (recherche, filtre par rôle : étudiant/mentor/enseignant/admin).
- Vue des contenus signalés (ressources, sujets de forum, réponses) avec actions : ignorer, supprimer, avertir l'utilisateur.
- Statistiques simples : nombre d'utilisateurs actifs, nombre de demandes d'aide, taux de mise en relation (alignées sur les KPIs du cahier des charges).

Contraintes : route protégée strictement côté serveur (pas seulement côté client), RLS. Propose le plan avant d'exécuter.
