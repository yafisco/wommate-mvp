# Prompt 01b — Interface de base visible (layout, navigation, page d'accueil)

## Pourquoi ce prompt
À exécuter après 01 (setup) et 00 (système de design). Construit le squelette visuel réel du site — architecture de composants incluse — pour que tu voies un vrai rendu dès `npm run dev`, avant d'attaquer la logique métier.

## Prompt à copier-coller

En t'appuyant sur le système de design mis en place (prompt 00) et sur ANTIGRAVITY.md / PROJECT_SPEC.md, construis l'architecture frontend de base, sans logique métier pour l'instant (pas encore d'auth ni de données réelles, juste des données factices si besoin).

**Architecture de dossiers à respecter**
```
/app
  layout.tsx          -> layout global (header + footer + fonts)
  page.tsx             -> page d'accueil
  /demandes/page.tsx    -> coquille, sera rempli au prompt 03
  /ressources/page.tsx  -> coquille, sera rempli au prompt 05
  /profil/page.tsx      -> coquille, sera rempli au prompt 02
/components
  /ui        -> Button, Card, Badge, Avatar, Input... (du prompt 00)
  /layout    -> Header, Footer, BottomNav (mobile), Container
  /features  -> composants spécifiques à une fonctionnalité (vide pour l'instant, sera peuplé au fur et à mesure)
```

**Layout global (/app/layout.tsx)**
- Header desktop : logo/nom du projet, liens de navigation (Accueil, Demandes d'aide, Ressources, Mon profil), bouton "Se connecter" / "S'inscrire"
- BottomNav mobile : Accueil, Demandes, Ressources, Messages, Profil (icônes + labels courts)
- Footer simple (liens utiles, mention du projet)
- Le Header desktop et le BottomNav mobile ne doivent jamais être visibles en même temps (utilise les breakpoints Tailwind, pas de JS de détection)

**Page d'accueil (/app/page.tsx)**
1. Hero avec le "Cercle du Grin" (composition animée de points/avatars en cercle, cf. prompt 00) + titre + pitch court (entraide étudiante : demandes d'aide, ressources, mentorat) + bouton d'appel à l'action "Rejoindre la communauté"
2. Section "Comment ça marche" : 3 blocs illustrant les fonctionnalités clés du MVP (mise en relation, partage de ressources, messagerie), en Card avec coin asymétrique
3. Section chiffres clés (mono font pour les nombres) si pertinent, sinon passe directement au CTA final
4. CTA final avant le footer

**Pages coquilles** (/demandes, /ressources, /profil)
- Header de page (titre + description courte) + message "Cette section arrive bientôt" — elles seront remplies par les prompts suivants du kit

**Exigences transverses**
- Mobile-first, teste visuellement à 360px, 768px et 1280px
- Utilise next/image pour toute image, next/font pour les polices
- Vérifie le contraste texte/fond sur toutes les zones utilisant `attaya` ou `indigo-nuit`
- Pas de dépendance JS lourde pour l'animation du hero (CSS/SVG natif ou une librairie légère déjà présente dans le projet)

Objectif : qu'après `npm run dev`, je voie un vrai site avec navigation, hero animé et sections cohérentes avec le système de design, avant de commencer l'authentification.

Propose le plan de fichiers avant d'exécuter.
