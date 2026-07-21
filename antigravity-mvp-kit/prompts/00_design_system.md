# Prompt 00 — Système de design "Le Grin numérique"

## Pourquoi ce prompt
À exécuter avant 01b. Il pose le système de design (tokens, typographie, composants de base) que toutes les pages suivantes devront respecter. Sans ça, chaque prompt suivant réinvente son propre style et le résultat devient incohérent.

## Prompt à copier-coller

Nous allons mettre en place un système de design cohérent avant de construire les pages. Concept directeur : "Le Grin numérique" — le grin est un cercle d'entraide traditionnel ouest-africain (on se réunit, on discute, on s'aide) ; la plateforme le transpose en ligne. Design sobre et professionnel, pas un style "startup SaaS générique".

Configure Tailwind CSS avec les tokens suivants (à mettre dans tailwind.config + variables CSS globales) :

**Couleurs**
- `bone` #F7F4EC — fond de page
- `indigo-nuit` #232752 — header, footer, titres, sections sombres
- `attaya` #E8A63D — accent principal, CTA
- `pousse` #3F8F63 — succès, confirmation, badges positifs
- `terre` #C1502E — alerte/signalement uniquement (usage rare, jamais décoratif)
- `encre` #1B1B29 — texte primaire
- `brume` #5B5A6E — texte secondaire

**Typographie**
- Display (titres) : "Bricolage Grotesque" (Google Fonts), poids 600-700, utilisée avec retenue (titres de section, hero)
- Corps de texte : "Inter" (Google Fonts), poids 400-500
- Utilitaire (badges, filières, stats, dates) : "IBM Plex Mono"
- Charge les 3 polices via next/font/google pour optimiser le chargement (important pour la contrainte de connectivité limitée du cahier des charges)

**Composants de base à créer dans /components/ui/**
- Button (variantes : primaire = fond attaya, secondaire = contour indigo-nuit, ghost)
- Card (coin asymétrique : border-radius plus prononcé en haut-gauche qu'ailleurs, ex. `rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md`)
- Badge (pour filière, statut de demande, rôle utilisateur)
- Avatar (avec initiales en fallback si pas de photo)
- Input / Textarea / Select stylés cohérents avec le reste

**Navigation responsive**
- Desktop (≥768px) : barre de navigation horizontale en haut, fond indigo-nuit, logo + liens + bouton connexion
- Mobile (<768px) : barre de navigation fixe en bas de l'écran (bottom tab bar) avec les actions principales (Accueil, Demandes, Ressources, Messages, Profil), icônes + labels courts, optimisée pour une utilisation à une main

**Signature visuelle (hero de la page d'accueil uniquement)**
Une composition circulaire animée : plusieurs avatars/points disposés en cercle (représentant un "grin"), reliés par de fines lignes qui pulsent doucement pour évoquer une mise en relation qui se crée en temps réel. Reste discret ailleurs sur le site — cet effet n'apparaît que sur le hero de la page d'accueil.

**Contraintes transverses (à respecter sur toutes les pages, cf. ANTIGRAVITY.md)**
- Mobile-first, testé jusqu'à 360px de large
- Performances : images en next/image avec lazy loading, pas de librairie CSS/JS lourde inutile (contrainte connectivité limitée du cahier des charges)
- Accessibilité : contraste suffisant (surtout texte sur fond attaya/bone), focus visible au clavier, alt text sur les images
- Mode "dégradé" : les pages doivent rester lisibles et utilisables si les images ne chargent pas

Propose-moi d'abord un plan (fichiers de config Tailwind, structure /components/ui, aperçu des tokens) avant de générer le code.
