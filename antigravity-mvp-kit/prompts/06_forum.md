# Prompt 06 — Forum communautaire par filière (Should Have)

## Pourquoi ce prompt
S'appuie sur le système de design "Le Grin numérique" (prompt 00) et sur templates/schema_bdd.md. Crée les tables nécessaires si absentes (sujets, réponses, réactions, tags).

## Prompt à copier-coller

Implémente le forum / espace questions-réponses organisé par filière, en respectant strictement le système de design déjà en place (tokens `bone`/`bg-nuit`, `indigo-nuit`, `attaya`, `pousse`, `terre`, `encre`/`ivoire`, `brume`, polices Bricolage Grotesque / Inter / IBM Plex Mono, coins de carte asymétriques, mode clair/sombre).

**Modèle de données**
Étends templates/schema_bdd.md si besoin : `groupes_thematiques` (déjà présent), `sujets_forum` (déjà présent, ajoute `tags text[]`), `reponses_forum` (déjà présent, ajoute `parent_id uuid` nullable pour les réponses imbriquées), nouvelle table `reactions_forum` (`id`, `cible_type` sujet/réponse, `cible_id`, `utilisateur_id`, `type` utile/merci, `created_at`). RLS sur toutes les tables.

**Fonctionnalités**
- Liste des filières/thématiques (`GroupeThématique`) en cartes cliquables `Card` (coin asymétrique du design system), icône + couleur distinctive par filière (piochée parmi `attaya`/`pousse`/`indigo-nuit` en variantes de teinte, jamais de couleurs hors palette), compteur de sujets actifs en `IBM Plex Mono`.
- Créer un sujet / répondre à un sujet avec éditeur markdown léger (gras, italique, liens, blocs de code, mention @utilisateur).
- Réponses imbriquées, 2 niveaux maximum (au-delà, les réponses au niveau 2 restent à plat pour ne pas complexifier l'UI mobile).
- Réactions rapides sur sujets/réponses : "utile" (icône check, couleur `pousse`) et "merci" (icône cœur, couleur `attaya`) — pas d'emoji brut, utilise des icônes du set déjà utilisé dans le reste de l'app pour rester cohérent visuellement. Plus signalement (icône drapeau, couleur `terre`, discret).
- Tags/mots-clés par sujet (`TagChip`, nouveau composant réutilisable dans /components/ui : fond `bone`/`bg-nuit` selon le thème, texte `indigo-nuit`/`ivoire`), filtrables.
- Tri : Récent / Populaire (activité + réactions) / Sans réponse — en `Select` du design system, pas de tableau de filtres complexe.
- Recherche instantanée (titre + tags), suggestions au fil de la frappe, champ style `Input` du design system.
- Aperçu de profil au survol (desktop) ou au tap (mobile) : `Avatar` + rôle (`Badge`) + nombre de contributions (`IBM Plex Mono`).
- Badge visuel distinctif pour les mentors/contributeurs expérimentés sur leurs réponses (`Badge` variante `pousse`).

**Layout & responsive**
- Feed en cartes (`Card`), pas de tableau façon forum classique : hiérarchie titre > extrait > métadonnées, espacement généreux cohérent avec le reste du site.
- Mobile (<768px) : navigation par filières en tiroir latéral (drawer), cohérent avec le `BottomNav` déjà en place pour le reste de l'app.
- Desktop (≥768px) : sidebar fixe listant les filières.
- Skeleton loaders pendant le chargement (pas de spinner), scroll infini paginé (pas de pagination numérotée).
- Micro-interactions légères sur réaction/tag (transition douce, pas d'animation lourde — respecte la contrainte de connectivité limitée), transition douce à l'ouverture d'un sujet.
- États vides illustrés avec le ton du reste du site (ex. "Aucun sujet pour l'instant dans cette filière — sois le premier à lancer la discussion"), cohérents avec l'esprit "grin" (entraide, pas de ton corporate).
- Indicateurs de fraîcheur ("répondu il y a 5 min", pastille "nouveau" en `attaya`).

**Composants réutilisables à créer/étendre dans /components/ui**
- `TagChip`, `ReactionButton`, `SkeletonCard` (nouveaux)
- Réutilise `Card`, `Avatar`, `Badge`, `Button`, `Input`, `Select` déjà créés au prompt 00/01b — ne duplique pas de styles, étends les composants existants si un variant manque.

**Contraintes**
- RLS stricte sur toutes les nouvelles tables.
- Pagination/scroll infini pour rester léger sur connexion limitée.
- Mobile-first, testé à 360px/768px/1280px.
- Respecte templates/definition_of_done.md avant de considérer la fonctionnalité terminée.

Propose le plan (fichiers, composants nouveaux vs réutilisés, migration SQL) avant d'exécuter.
